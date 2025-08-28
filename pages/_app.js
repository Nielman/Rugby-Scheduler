export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          @page { size: A4 portrait; margin: 12mm; }
          body { font-size: 12pt; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page { page-break-after: always; }
          .print-card {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 8px;
            margin-bottom: 8px;
            background: #fff;
          }
          .print-h2 { margin: 0 0 8px 0; font-size: 18pt; }
          .print-h4 { margin: 0 0 6px 0; font-size: 12pt; }
        }
        @media screen { .print-only { display: none; } }
      `}</style>
    </>
  );
}