import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  InputGroup,
  FormControl,
  Button,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";
import "./Menu.scss";

const CURRENCIES = [
  "USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "CHF",
  "CNY", "SGD", "AED", "MYR", "NZD", "HKD", "SEK", "NOK",
];

const API = "https://api.frankfurter.dev";

function convert(base, quote, amount) {
  return fetch(`${API}/v2/rate/${base}/${quote}`)
    .then((r) => r.json())
    .then((d) => (amount * d.rate).toFixed(2));
}

const CurrencyConverter = () => {
  const [amount, setAmount] = useState("");
  const [base, setBase] = useState("INR");
  const [quote, setQuote] = useState("USD");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [fromCache, setFromCache] = useState(false);

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
    setError("");
    setResult(null);
    setFromCache(false);
    setLoading(true);

    // Detect whether the response came from the service worker cache
    // by checking online status before and after the fetch resolves.
    const wasOnline = navigator.onLine;

    convert(base.toLowerCase(), quote.toLowerCase(), parsed)
      .then((res) => {
        setResult(res);
        setFromCache(!wasOnline || !navigator.onLine);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch exchange rate. Please try again.");
        setLoading(false);
      });
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
            {CURRENCIES.map((c) => (
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
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Form.Select>
        </Col>

        <Col>
          <Button
            className="navbar"
            onClick={handleConvert}
            disabled={!amount || loading}
          >
            {loading ? <Spinner animation="border" size="sm" /> : "Convert"}
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
                ⚠ Showing cached rate — connect to the internet for the latest rate.
              </Form.Text>
            )}
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default CurrencyConverter;
