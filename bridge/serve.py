"""Ponte local do DoPSite_Reel.

Serve os MP4 que já estão em DoPSite-RV para o site publicado
(https://thetbeck.github.io/DoPSite_Reel/) via https://127.0.0.1:4174.
O GitHub não lê disco. Só o navegador desta máquina alcança este processo.
"""

from __future__ import annotations

import datetime
import ipaddress
import mimetypes
import ssl
import subprocess
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
CERT_DIR = Path(__file__).resolve().parent / "certs"
CA_CRT = CERT_DIR / "ca.crt"
CA_KEY = CERT_DIR / "ca.key"
LEAF_CRT = CERT_DIR / "localhost.crt"
LEAF_KEY = CERT_DIR / "localhost.key"
HOST = "127.0.0.1"
PORT = 4174


def _pem_key(key) -> bytes:
    from cryptography.hazmat.primitives import serialization

    return key.private_bytes(
        serialization.Encoding.PEM,
        serialization.PrivateFormat.PKCS8,
        serialization.NoEncryption(),
    )


def _pem_cert(cert) -> bytes:
    from cryptography.hazmat.primitives import serialization

    return cert.public_bytes(serialization.Encoding.PEM)


def ensure_certs() -> None:
    if LEAF_CRT.exists() and LEAF_KEY.exists() and CA_CRT.exists():
        return
    from cryptography import x509
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.x509.oid import ExtendedKeyUsageOID, NameOID

    CERT_DIR.mkdir(parents=True, exist_ok=True)
    now = datetime.datetime.now(datetime.timezone.utc)
    ca_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    ca_name = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, "Cine Beck Local Bridge CA")])
    ca_cert = (
        x509.CertificateBuilder()
        .subject_name(ca_name)
        .issuer_name(ca_name)
        .public_key(ca_key.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(now)
        .not_valid_after(now + datetime.timedelta(days=825))
        .add_extension(x509.BasicConstraints(ca=True, path_length=0), critical=True)
        .add_extension(x509.KeyUsage(
            digital_signature=True, key_cert_sign=True, crl_sign=True,
            content_commitment=False, key_encipherment=False, data_encipherment=False,
            key_agreement=False, encipher_only=False, decipher_only=False,
        ), critical=True)
        .sign(ca_key, hashes.SHA256())
    )
    leaf_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    leaf_name = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, "127.0.0.1")])
    leaf_cert = (
        x509.CertificateBuilder()
        .subject_name(leaf_name)
        .issuer_name(ca_name)
        .public_key(leaf_key.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(now)
        .not_valid_after(now + datetime.timedelta(days=825))
        .add_extension(x509.BasicConstraints(ca=False, path_length=None), critical=True)
        .add_extension(x509.SubjectAlternativeName([
            x509.DNSName("localhost"),
            x509.IPAddress(ipaddress.IPv4Address("127.0.0.1")),
        ]), critical=False)
        .add_extension(x509.ExtendedKeyUsage([ExtendedKeyUsageOID.SERVER_AUTH]), critical=False)
        .sign(ca_key, hashes.SHA256())
    )
    CA_CRT.write_bytes(_pem_cert(ca_cert))
    CA_KEY.write_bytes(_pem_key(ca_key))
    LEAF_CRT.write_bytes(_pem_cert(leaf_cert))
    LEAF_KEY.write_bytes(_pem_key(leaf_key))


def trust_ca() -> None:
    subprocess.run(
        ["certutil", "-user", "-addstore", "Root", str(CA_CRT)],
        check=False,
    )


def safe_path(url_path: str) -> Path | None:
    rel = unquote(urlsplit(url_path).path).lstrip("/")
    if not rel or rel.endswith("/"):
        return None
    target = (ROOT / rel).resolve()
    root = ROOT.resolve()
    if target != root and root not in target.parents:
        return None
    if not target.is_file():
        return None
    return target


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt: str, *args) -> None:
        super().log_message(fmt, *args)

    def _cors(self) -> None:
        origin = self.headers.get("Origin") or "https://thetbeck.github.io"
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Private-Network", "true")
        self.send_header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Vary", "Origin")

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self._cors()
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_HEAD(self) -> None:
        self._serve(write_body=False)

    def do_GET(self) -> None:
        self._serve(write_body=True)

    def _serve(self, write_body: bool) -> None:
        path = urlsplit(self.path).path
        if path == "/bridge.json":
            body = b'{"ok":true,"host":"127.0.0.1","port":4174}'
            self.send_response(200)
            self._cors()
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            if write_body:
                self.wfile.write(body)
            return

        target = safe_path(self.path)
        if target is None:
            body = b"not found"
            self.send_response(404)
            self._cors()
            self.send_header("Content-Type", "text/plain")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            if write_body:
                self.wfile.write(body)
            return

        size = target.stat().st_size
        mime = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
        start, end = 0, size - 1
        status = 200
        range_header = self.headers.get("Range")
        if range_header and range_header.startswith("bytes="):
            spec = range_header.split("=", 1)[1].split(",", 1)[0].strip()
            left, _, right = spec.partition("-")
            try:
                if left == "":
                    length = int(right)
                    start = max(size - length, 0)
                    end = size - 1
                else:
                    start = int(left)
                    end = int(right) if right else size - 1
                end = min(end, size - 1)
                if start <= end:
                    status = 206
            except ValueError:
                start, end, status = 0, size - 1, 200

        length = end - start + 1 if size else 0
        self.send_response(status)
        self._cors()
        self.send_header("Content-Type", mime)
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Length", str(length))
        if status == 206:
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.end_headers()
        if not write_body or length == 0:
            return
        with target.open("rb") as fh:
            fh.seek(start)
            remaining = length
            while remaining:
                chunk = fh.read(min(1024 * 256, remaining))
                if not chunk:
                    break
                try:
                    self.wfile.write(chunk)
                except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
                    break
                remaining -= len(chunk)


def main() -> None:
    ensure_certs()
    trust_ca()
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ctx.load_cert_chain(LEAF_CRT, LEAF_KEY)
    httpd = ThreadingHTTPServer((HOST, PORT), Handler)
    httpd.socket = ctx.wrap_socket(httpd.socket, server_side=True)
    print(f"ponte https://{HOST}:{PORT}/  raiz {ROOT}", flush=True)
    httpd.serve_forever()


if __name__ == "__main__":
    main()
