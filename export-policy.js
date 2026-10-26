(function (root) {
  function imageIdentity(value) {
    const source = String(value || "").trim();
    if (!source || source.startsWith("data:")) return source;
    try { return decodeURIComponent(new URL(source, "https://raizeskids.com/").pathname); }
    catch { return source.split(/[?#]/)[0]; }
  }

  function isPaymentImageSource(source, paymentSource = "") {
    const identity = imageIdentity(source);
    if (!identity) return false;
    if (paymentSource && identity === imageIdentity(paymentSource)) return true;
    const filename = identity.split("/").pop();
    return /^(?:payment[-_]?qr|qr[-_]?(?:payment|pix|pagamento)|pix[-_]?qr)(?:[-_.]|$)/i.test(filename);
  }

  const policy = { isPaymentImageSource };
  if (typeof module !== "undefined" && module.exports) module.exports = policy;
  else root.raizesExportPolicy = policy;
})(typeof globalThis !== "undefined" ? globalThis : this);
