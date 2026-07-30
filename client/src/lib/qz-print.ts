/**
 * QZ Tray print service — browser-side bridge to local thermal printers.
 * QZ Tray must be running on the billing counter PC (wss://localhost:8182).
 * Uses QZ Tray Demo Cert for signing — allows silent printing without prompts.
 */

// @ts-ignore — qz-tray ships a UMD bundle; types are loose
import qz from "qz-tray";

// ─── QZ Tray Demo Certificate (public — safe to embed) ───────────────────────
const QZ_CERT = `-----BEGIN CERTIFICATE-----
MIIECzCCAvOgAwIBAgIGAZ+vGTASMA0GCSqGSIb3DQEBCwUAMIGiMQswCQYDVQQG
EwJVUzELMAkGA1UECAwCTlkxEjAQBgNVBAcMCUNhbmFzdG90YTEbMBkGA1UECgwS
UVogSW5kdXN0cmllcywgTExDMRswGQYDVQQLDBJRWiBJbmR1c3RyaWVzLCBMTEMx
HDAaBgkqhkiG9w0BCQEWDXN1cHBvcnRAcXouaW8xGjAYBgNVBAMMEVFaIFRyYXkg
RGVtbyBDZXJ0MB4XDTI2MDcyODE4MTgxMVoXDTQ2MDcyODE4MTgxMVowgaIxCzAJ
BgNVBAYTAlVTMQswCQYDVQQIDAJOWTESMBAGA1UEBwwJQ2FuYXN0b3RhMRswGQYD
VQQKDBJRWiBJbmR1c3RyaWVzLCBMTEMxGzAZBgNVBAsMElFaIEluZHVzdHJpZXMs
IExMQzEcMBoGCSqGSIb3DQEJARYNc3VwcG9ydEBxei5pbzEaMBgGA1UEAwwRUVog
VHJheSBEZW1vIENlcnQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDP
h0nV7jaEZEpY+gtM3LHR3EqCMGeJL2c6FrclGxLNHONi1fsdemELiA8l+YfZ0DJf
pR483SBduRe2pODbZi1qa0OHoW9FaMbniprOVGveoUMAomCWCBz/t+8ZbFmsPXsk
bbB1jIwLmjZh1t6dlEUqwg3MtCFec1q3ttaOsfRDqHpeLN12SgdnZt9qAfT/YZTA
hexNgGXRahvj/eW3dBZ3LAfVPhXDT2y0NGTKRvQkr+7eWaiLbXlzrK1J3eh0GJpi
JjBXZgu1s7ugv8yuzR6mW23V9W3sZvOQPbQsHVa6Y3doLY4HrjaJb0mBENP3jrq6
85KvsgzCVqSkmtKC832tAgMBAAGjRTBDMBIGA1UdEwEB/wQIMAYBAf8CAQEwDgYD
VR0PAQH/BAQDAgEGMB0GA1UdDgQWBBT9wkzYE80VRk6RWxvq0q1JRT0I3zANBgkq
hkiG9w0BAQsFAAOCAQEAKK8ZeKO4LQ+4CspFOxg3hnWJIfuemJiekpyE50UtaMTV
eEKPEKrcYVIr018//zTosVp6yvvjxahmNij5YOSS1bZtQUEaSsU/2T7jvAComlPa
MFOhu7Uok/dqJn1IXzkKL13JbS3+VwEkAm6Wevx5OU6B4OnDkTp7wOlWdBFiurdi
Wvl0I51LnMQwGf8TG9Me0GoaFfvTb/GbPM1XnTZVjK+XigL/BV4hkVaECieLHovb
DIApwYitYkIK5FB/H4UEv+6v9xqrkzqJn1yjqhmMElnALGOi1dXCo9YYa+pAuRBC
JMZqKXJATGncGNsDk7Q00wBdZY+0/9SU3hVJOz+dVQ==
-----END CERTIFICATE-----`;

// ─── QZ Tray Demo Private Key (demo key — safe to embed) ─────────────────────
const QZ_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDPh0nV7jaEZEpY
+gtM3LHR3EqCMGeJL2c6FrclGxLNHONi1fsdemELiA8l+YfZ0DJfpR483SBduRe2
pODbZi1qa0OHoW9FaMbniprOVGveoUMAomCWCBz/t+8ZbFmsPXskbbB1jIwLmjZh
1t6dlEUqwg3MtCFec1q3ttaOsfRDqHpeLN12SgdnZt9qAfT/YZTAhexNgGXRahvj
/eW3dBZ3LAfVPhXDT2y0NGTKRvQkr+7eWaiLbXlzrK1J3eh0GJpiJjBXZgu1s7ug
v8yuzR6mW23V9W3sZvOQPbQsHVa6Y3doLY4HrjaJb0mBENP3jrq685KvsgzCVqSk
mtKC832tAgMBAAECggEADMXxMblsghgRKmpTfTrdOANE08AKc1tnUWA6DA7fSKAl
T71HbEBOzlCkzAvQhIPHwfLOCmV620Hr93os+9wNYg4xlRzG1kEVcwVpM1dnX0fS
Ma0M4Fcl/8hQr2Inn84V8P9OW+HXcdRfUgTRZWYNnszcYBPbNO7JL+MRUC2cUPim
hKQDH4+HoJLs3G2lo6u28m7NvEM+GwSeXB2i0Hpbo8nTdDsrw4wSXJGOmBmbRJEH
/V58P3aqObn7KQkAjzBHL6LKjEJ7YKa/UeVZX+IeiSM1OIvAYkvrrkqU1APLpIIp
66hiPPOEGdSQckvHVW0/cA4cC0kNgSKWORT6nPIx4QKBgQD24aG54fLTsa0MIgM7
Df9F/iKmZO57C6ISh+tqFL+Z9j1umN7jmZ0cAh6hZgU+34ehLJDK5AuZGQjV2FYR
wmsSlVkxItxiae5cqiMngUJhr6Tcx8q+0WQzC1a+GjPCD1jLpC6/XaIAUVPoGMFa
HFWYTEIfgssY/zboZLSB+IckzQKBgQDXMY7qC1OvA8y96zmqKuyCkZlx+vnhXQDM
JizbXVPOeYJD31c/UWNfA4wA0Lh9hX3RgDBOOi5pGGLEEeUoP+2S+aff1awZFIyG
QTAWfrKVSDfGBCgufdpwCF5ARQ6WH9g0jw//NY7t9W1PvdCJ6mryZvqugWo1zQzl
OJqzO5i8YQKBgQDIXaUJHLUcVHZSg4RFuH12i+QJUZ8vY+icy40nYkGCrhN7oDw9
Uh3tblb3vLoDJh2IlIfK8rvq/CNskxB/h1+pDGb/9wAQK1MWB8tSM5jxeUD/InOM
3JpKxygWT2O0WwpA9DYwf8iMI3VKyFScUqSxXyrHMjqtReyFPb42QcNE/QKBgQC3
7ys5z36y3GuXdcSvN8s6e1sN+ri1MXpqBMNYqTfmByQaAX+gpl9qqixz0fOvjneR
p6EibEaZG/fnoWge9C2L8ArWnttgAJlwc623vInGYZkSjyENRBN+qRhulNg353Y0
zoec21mU+a96dkMWbyEEmpLwr7tpyx+Xmb9ZLbqKYQKBgAcqU14si1dgEq6/0z2L
J/+viUGgTMUpFaZd3Fs6BiTNBqLlBr203etPOpE0A+/5Z+XESC7SFNXwl6L4fcvw
VCfqlJOKf7uXcv89GGadmZ9TmPcMp1gJlzdZUpQx5gPhlU3HKlLtnbUXg0aVwE32
a7rVERxpPPDf2jHI4eoujkky
-----END PRIVATE KEY-----`;

// ─── Sign a string with the private key using SHA-512/RSA ────────────────────
async function signData(toSign: string): Promise<string> {
  const pemContents = QZ_PRIVATE_KEY
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");

  const binaryStr = atob(pemContents);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

  const key = await crypto.subtle.importKey(
    "pkcs8",
    bytes.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-512" },
    false,
    ["sign"]
  );

  const data = new TextEncoder().encode(toSign);
  const sig = await crypto.subtle.sign({ name: "RSASSA-PKCS1-v1_5" }, key, data);

  const sigBytes = new Uint8Array(sig);
  let binary = "";
  for (let i = 0; i < sigBytes.length; i++) binary += String.fromCharCode(sigBytes[i]);
  return btoa(binary);
}

// ─── Status ───────────────────────────────────────────────────────────────────
type QZStatus = "disconnected" | "connecting" | "connected" | "error";

let _status: QZStatus = "disconnected";
const _listeners = new Set<(s: QZStatus) => void>();

function setStatus(s: QZStatus) {
  _status = s;
  _listeners.forEach((fn) => fn(s));
}

export function getQZStatus(): QZStatus { return _status; }

export function onQZStatusChange(fn: (s: QZStatus) => void): () => void {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

// ─── Connect ──────────────────────────────────────────────────────────────────
export async function connectQZ(): Promise<void> {
  if (qz.websocket.isActive()) { setStatus("connected"); return; }

  setStatus("connecting");

  // Provide the demo certificate so QZ Tray trusts this site
  qz.security.setCertificatePromise(
    (resolve: (v: string) => void) => resolve(QZ_CERT)
  );

  // Sign every request with the demo private key
  qz.security.setSignatureAlgorithm("SHA512");
  qz.security.setSignaturePromise(
    (toSign: string) => signData(toSign)
  );

  try {
    await qz.websocket.connect({
      host: "localhost",
      port: { secure: 8182, insecure: 8181 },
      // Chrome allows ws://localhost from HTTPS pages (localhost is a secure context).
      // Port 8182 (wss) requires QZ Tray SSL cert to be installed — skip it.
      usingSecure: false,
      keepAlive: 30,
      retries: 1,
    });
    setStatus("connected");
    qz.websocket.setClosedCallbacks(() => setStatus("disconnected"));
    qz.websocket.setErrorCallbacks(()  => setStatus("error"));
  } catch (err) {
    setStatus("error");
    throw err;
  }
}

export async function disconnectQZ(): Promise<void> {
  if (qz.websocket.isActive()) await qz.websocket.disconnect();
  setStatus("disconnected");
}

export function isQZConnected(): boolean {
  return qz.websocket.isActive();
}

// ─── Print raw ESC/POS bytes directly to printer IP:port ─────────────────────
export async function printRawToIP(
  ip: string,
  port: number,
  bytes: Uint8Array
): Promise<void> {
  if (!isQZConnected()) await connectQZ();
  await qz.socket.open(ip, { port, encoding: "plain" });
  await qz.socket.sendData(ip, { port }, Array.from(bytes));
  await new Promise((r) => setTimeout(r, 500));
  await qz.socket.close(ip, { port });
}

// ─── Check if printer is reachable via QZ Tray TCP socket ────────────────────
export async function checkPrinterOnlineViaQZ(
  ip: string,
  port: number
): Promise<boolean> {
  try {
    if (!isQZConnected()) await connectQZ();
    await qz.socket.open(ip, { port, encoding: "plain" });
    await qz.socket.close(ip, { port });
    return true;
  } catch {
    return false;
  }
}
