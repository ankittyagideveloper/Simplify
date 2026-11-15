import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  InputGroup,
  FormControl,
  Button,
  Form,
  Alert,
} from "react-bootstrap";
import "./Menu.scss";

const DEFAULT_CURRENCIES = [
  "USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "CHF",
  "CNY", "SGD", "AED", "MYR", "NZD", "HKD", "SEK", "NOK",
];

const API = "https://api.frankfurter.dev";
const CACHE_KEY = "fx_rates_v1";

const loadCache = () => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY));
  } catch {
    return null;
  }
};

// Fetch all rates (EUR base) and persist them for offline use.
const fetchAllRates = async () => {
  const res = await fetch(`${API}/v2/rates`);
  if (!res.ok) throw new Error("Bad response");
  const list = await res.json();
  const rates = { EUR: 1 };
  let date = "";
  list.forEach((r) => {
    rates[r.quote] = r.rate;
    if (r.date > date) date = r.date;
  });
  const data = { base: "EUR", date, rates, fetchedAt: Date.now() };
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  return data;
};

const convertLocal = (rates, base, quote, amount) =>
  ((amount * rates[quote]) / rates[base]).toFixed(2);

const CurrencyConverter = () => {
  const [amount, setAmount] = useState("");
  const [base, setBase] = useState("INR");
  const [quote, setQuote] = useState("USD");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [fromCache, setFromCache] = useState(false);
  const [ratesData, setRatesData] = useState(loadCache);

  // Refresh the rates cache whenever we are online
  useEffect(() => {
    if (!isOnline) return;
    fetchAllRates()
      .then((d) => setRatesData(d))
      .catch(() => {}); // keep whatever is cached
  }, [isOnline]);

  const currencies = ratesData
    ? Object.keys(ratesData.rates).sort()
    : DEFAULT_CURRENCIES;

  // Track online/offline status
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const handleConvert = () => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (base === quote) {
      setResult(parsed.toFixed(2));
      setFromCache(false);
      return;
    }
    const rates = ratesData && ratesData.rates;
    if (!rates || !rates[base] || !rates[quote]) {
      setError("No exchange rates available. Connect to the internet once to download them.");
      return;
    }
    setError("");
    setResult(convertLocal(rates, base, quote, parsed));
    setFromCache(!isOnline);
  };

  const handleSwap = () => {
    setBase(quote);
    setQuote(base);
    setResult(null);
    setError("");
    setFromCache(false);
  };

  return (
    <Container style={{ marginTop: "3%" }}>
      <div className="d-flex align-items-center gap-2 mb-3">
        <h5 className="mb-0">Currency Converter</h5>
        {isOnline ? (
          <span className="badge bg-success" style={{ fontSize: "0.7rem" }}>● Online</span>
        ) : (
          <span className="badge bg-secondary" style={{ fontSize: "0.7rem" }}>● Offline</span>
        )}
      </div>

      {!isOnline && (
        <Alert variant="warning" className="py-2">
          You're offline — results will use the last cached exchange rates.
        </Alert>
      )}

      <Row className="align-items-end mb-3" xs="auto">
        <Col>
          <Form.Label>Amount</Form.Label>
          <InputGroup>
            <FormControl
              type="number"
              min="0"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setResult(null);
                setError("");
                setFromCache(false);
              }}
            />
          </InputGroup>
        </Col>

        <Col>
          <Form.Label>From</Form.Label>
          <Form.Select value={base} onChange={(e) => { setBase(e.target.value); setResult(null); }}>
            {currencies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Form.Select>
        </Col>

        <Col>
          <Button variant="outline-secondary" onClick={handleSwap} title="Swap currencies">
            ⇄
          </Button>
        </Col>

        <Col>
          <Form.Label>To</Form.Label>
          <Form.Select value={quote} onChange={(e) => { setQuote(e.target.value); setResult(null); }}>
            {currencies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Form.Select>
        </Col>

        <Col>
          <Button
            className="navbar"
            onClick={handleConvert}
            disabled={!amount}
          >
            Convert
          </Button>
        </Col>
      </Row>

      {error && <Form.Text className="text-danger">{error}</Form.Text>}

      {result !== null && !error && (
        <Row>
          <Col>
            <div className="mt-2 fs-5">
              {parseFloat(amount).toFixed(2)} {base} ={" "}
              <strong>{result} {quote}</strong>
            </div>
            {fromCache && (
              <Form.Text className="text-muted">
                ⚠ Showing cached rates{ratesData && ratesData.date ? ` from ${ratesData.date}` : ""} — connect to the internet for the latest rates.
              </Form.Text>
            )}
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default CurrencyConverter;
