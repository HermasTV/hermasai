export function Footer() {
  return (
    <div>
      <footer className="container text-muted">
        <p className="text-center">© 2024 | Ahmed Hermas | All Rights Reserved.</p>
      </footer>
      <style jsx>{`
        footer {
          text-align: center;
          margin: 0 auto;
          padding: 20px;
          color: #6c757d;
          width: 100%;
          position: relative;
          bottom: 0;
        }
        {/* override p css */}
        p {
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
