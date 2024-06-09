import { useEffect } from 'react';
import Navbar from '../../components/navbar';

const Home = () => {
  useEffect(() => {
    const buttons = document.querySelectorAll(".card-buttons button");
    const sections = document.querySelectorAll(".card-section");
    const card = document.querySelector(".card");

    const handleButtonClick = (e) => {
      const targetSection = e.target.getAttribute("data-section");
      const section = document.querySelector(targetSection);
      targetSection !== "#about"
        ? card.classList.add("is-active")
        : card.classList.remove("is-active");
      card.setAttribute("data-state", targetSection);
      sections.forEach((s) => s.classList.remove("is-active"));
      buttons.forEach((b) => b.classList.remove("is-active"));
      e.target.classList.add("is-active");
      section.classList.add("is-active");
    };

    buttons.forEach((btn) => {
      btn.addEventListener("click", handleButtonClick);
    });

    return () => {
      buttons.forEach((btn) => {
        btn.removeEventListener("click", handleButtonClick);
      });
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css?family=DM+Sans:400,500|Jost:400,500,600&display=swap");

        * {
          box-sizing: border-box;
        }
        body {
          color: #2b2c48;
          font-family: "Jost", sans-serif;
          background-image: url('https://www.davidbernie.com/wp-content/uploads/2023/11/David-Bernie-Wallpaper-Free-Palestine-Watermelon-I-Desktop-3456x2234-1-scaled.jpg');
          background-repeat: no-repeat;
          background-size: 100% 100%;
          background-position: center;
          background-attachment: fixed;
          min-height: 100vh;
          display: flex;
          align-items: baseline; /* Center horizontally */
          justify-content: center; /* Center vertically */
          padding: 20px;
        }

        .card {
          max-width: 340px;
          margin: auto;
          position: relative;
          z-index: 1;
          overflow: hidden;
          background-color: rgba(255, 255, 255, 1);
          display: flex;
          transition: 0.3s;
          flex-direction: column;
          border-radius: 10px;
          box-shadow: 0 0 0 8px rgba(255, 255, 255, 0.2);
        }

        .card[data-state="#about"] {
          height: 450px;
        }

        .card[data-state="#contact"] {
          height: 430px;
        }

        .card[data-state="#experience"] {
          height: 550px;
        }

        .card.is-active .card-header {
          height: 80px;
        }

        .card.is-active .card-cover {
          height: 100px;
          top: -50px;
        }

        .card.is-active .card-avatar {
          transform: none;
          left: 20px;
          width: 50px;
          height: 50px;
          bottom: 10px;
        }

        .card.is-active .card-fullname,
        .card.is-active .card-jobtitle {
          left: 86px;
          transform: none;
        }

        .card.is-active .card-fullname {
          bottom: 18px;
          font-size: 19px;
        }

        .card.is-active .card-jobtitle {
          bottom: 16px;
          letter-spacing: 1px;
          font-size: 10px;
        }

        .card-header {
          position: relative;
          display: flex;
          height: 200px;
          flex-shrink: 0;
          width: 100%;
          transition: 0.3s;
        }

        .card-cover {
          width: 100%;
          height: 100%;
          position: absolute;
          height: 160px;
          top: -20%;
          left: 0;
          will-change: top;
          background-size: cover;
          background-position: center;
          filter: blur(30px);
          transform: scale(1.2);
          transition: 0.5s;
        }

        .card-avatar {
          width: 100px;
          height: 100px;
          box-shadow: 0 8px 8px rgba(0, 0, 0, 0.2);
          border-radius: 50%;
          object-position: center;
          object-fit: cover;
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%) translateY(-64px);
        }

        .card-fullname {
          position: absolute;
          bottom: 0;
          font-size: 22px;
          font-weight: 700;
          text-align: center;
          white-space: nowrap;
          transform: translateY(-10px) translateX(-50%);
          left: 50%;
        }

        .card-jobtitle {
          position: absolute;
          bottom: 0;
          font-size: 11px;
          white-space: nowrap;
          font-weight: 500;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin: 0;
          left: 50%;
          transform: translateX(-50%) translateY(-7px);
        }

        .card-main {
          position: relative;
          flex: 1;
          display: flex;
          padding-top: 10px;
          flex-direction: column;
        }

        .card-subtitle {
          font-weight: 700;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .card-content {
          padding: 20px;
        }

        .card-desc {
          line-height: 1.6;
          color: #636b6f;
          font-size: 14px;
          margin: 0;
          font-weight: 400;
          font-family: "DM Sans", sans-serif;
        }

        .card-social {
          display: flex;
          align-items: center;
          padding: 0 20px;
          margin-bottom: 30px;
        }

        .card-social svg {
          fill: rgb(165, 181, 206);
          width: 16px;
          display: block;
          transition: 0.3s;
        }

        .card-social a {
          color: #8797a1;
          height: 32px;
          width: 32px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: 0.3s;
          background-color: rgba(93, 133, 193, 0.05);
          border-radius: 50%;
          margin-right: 10px;
        }

        .card-social a:hover svg {
          fill: darken(rgb(165, 181, 206), 20%);
        }

        .card-social a:last-child {
          margin-right: 0;
        }

        .card-buttons {
          display: flex;
          background-color: #fff;
          margin-top: auto;
          position: sticky;
          bottom: 0;
          left: 0;
        }

        .card-buttons button {
          flex: 1 1 auto;
          user-select: none;
          background: 0;
          font-size: 13px;
          border: 0;
          padding: 15px 5px;
          cursor: pointer;
          color: #5c5c6d;
          transition: 0.3s;
          font-family: "Jost", sans-serif;
          font-weight: 500;
          outline: 0;
          border-bottom: 3px solid transparent;
        }

        .card-buttons button.is-active,
        .card-buttons button:hover {
          color: #2b2c48;
          border-bottom: 3px solid #8a84ff;
          background: linear-gradient(
            to bottom,
            rgba(127, 199, 231, 0) 0%,
            rgba(207, 204, 255, 0.2) 44%,
            rgba(211, 226, 255, 0.4) 100%
          );
        }

        .card-section {
          display: none;
        }

        .card-section.is-active {
          display: block;
          animation: fadeIn 0.6s both;
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translatey(40px);
          }
          100% {
            opacity: 1;
          }
        }

        .card-timeline {
          margin-top: 30px;
          position: relative;
        }

        .card-timeline:after {
          background: linear-gradient(
            to top,
            rgba(134, 214, 243, 0) 0%,
            rgba(81, 106, 204, 1) 100%
          );
          content: "";
          left: 42px;
          width: 2px;
          top: 0;
          height: 100%;
          position: absolute;
          content: "";
        }

        .card-item {
          position: relative;
          padding-left: 60px;
          padding-right: 20px;
          padding-bottom: 20px;
          z-index: 1;
          list-style: none; /* Remove default bullet points */
        }
        
        .card-item:last-child {
          padding-bottom: 5px;
        }

        .card-item:after {
          content: attr(data-year);
          width: 10px;
          position: absolute;
          top: 0;
          left: 37px;
          width: 8px;
          height: 8px;
          line-height: 0.6;
          border: 2px solid #fff;
          font-size: 11px;
          text-indent: -35px;
          border-radius: 50%;
          color: rgba(#868686, 0.7);
          background: linear-gradient(
            to bottom,
            lighten(#516acc, 20%) 0%,
            #516acc 100%
          );
        }

        .card-item-title {
          font-weight: 500;
          font-size: 14px;
          margin-bottom: 5px;
        }

        .card-item-desc {
          font-size: 13px;
          color: #6f6f7b;
          line-height: 1.5;
          font-family: "DM Sans", sans-serif;
        }

        .card-contact-wrapper {
          margin-top: 20px;
        }

        .card-contact {
          display: flex;
          align-items: center;
          font-size: 13px;
          color: #6f6f7b;
          font-family: "DM Sans", sans-serif;
          line-height: 1.6;
          cursor: pointer;
        }

        .card-contact + .card-contact {
          margin-top: 16px;
        }

        .card-contact svg {
          flex-shrink: 0;
          width: 30px;
          min-height: 34px;
          margin-right: 12px;
          transition: 0.3s;
          padding-right: 12px;
          border-right: 1px solid #dfe2ec;
        }

        .contact-me {
          border: 0;
          outline: none;
          background: linear-gradient(
            to right,
            rgba(83, 200, 239, 0.8) 0%,
            rgba(81, 106, 204, 0.8) 96%
          );
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
          color: #fff;
          padding: 12px 16px;
          width: 100%;
          border-radius: 5px;
          margin-top: 25px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          font-family: "Jost", sans-serif;
          transition: 0.3s;
        }
      `}</style>
      
      <Navbar />
      <div className="card" data-state="#about">
        <div className="card-header">
          <div
            className="card-cover"
            style={{
              backgroundImage: `url('https://i.ibb.co/0yWyb0q/360-F-557185071-VIBFy-Ig-Ff-Fyt-Hnk-Lvmplkb-Di-Ow-Fe0c8n.jpg')`,
            }}
          ></div>
          <img
            className="card-avatar"
            src="https://i.ibb.co/znHTqbB/Whats-App-Image-2024-03-06-at-12-14-19-0814d8ff.jpg"
            alt="avatar"
          />
          <h1 className="card-fullname">Ahmed Hermas</h1>
          <h2 className="card-jobtitle">Computer Vision Engineer</h2>
        </div>
        <div className="card-main">
          <div className="card-section is-active" id="about">
            <div className="card-content">
              <div className="card-subtitle">ABOUT</div>
              <p className="card-desc">
                a passionate geek who loves to code and build things, using this platform to share my
                demo projects and experiments with the world.
              </p>
            </div>
            <div className="card-social">
              <a href="https://github.com/HermasTV">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              </a>

              <a href="https://www.instagram.com/ahmed_hermas/">
                <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                  <path d="M301 256c0 24.852-20.148 45-45 45s-45-20.148-45-45 20.148-45 45-45 45 20.148 45 45zm0 0" />
                  <path d="M332 120H180c-33.086 0-60 26.914-60 60v152c0 33.086 26.914 60 60 60h152c33.086 0 60-26.914 60-60V180c0-33.086-26.914-60-60-60zm-76 211c-41.355 0-75-33.645-75-75s33.645-75 75-75 75 33.645 75 75-33.645 75-75 75zm86-146c-8.285 0-15-6.715-15-15s6.715-15 15-15 15 6.715 15 15-6.715 15-15 15zm0 0" />
                  <path d="M377 0H135C60.562 0 0 60.563 0 135v242c0 74.438 60.563 135 135 135h242c74.438 0 135-60.563 135-135V135C512 60.562 451.437 0 377 0zm45 332c0 49.625-40.375 90-90 90H180c-49.625 0-90-40.375-90-90V180c0-49.625 40.375-90 90-90h152c49.625 0 90 40.375 90 90zm0 0" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/ahmedhermas/">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.994 24v-.001H24v-8.802c0-4.306-.927-7.623-5.961-7.623-2.42 0-4.044 1.328-4.707 2.587h-.07V7.976H8.489v16.023h4.97v-7.934c0-2.089.396-4.109 2.983-4.109 2.549 0 2.587 2.384 2.587 4.243V24zM.396 7.977h4.976V24H.396zM2.882 0C1.291 0 0 1.291 0 2.882s1.291 2.909 2.882 2.909 2.882-1.318 2.882-2.909A2.884 2.884 0 002.882 0z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="card-section" id="experience">
            <div className="card-content">
              <div className="card-subtitle">WORK EXPERIENCE</div>
              <div className="card-timeline">
                <div className="card-item" data-year="2024">
                  <div className="card-item-title">
                    Biometri ai - <span> AI Lead </span>
                    </div>
                  <div className="card-item-desc">
                  A facial recognition solution with anitpoofing. @Tahaluf UAE
                </div>
                </div>
                <div className="card-item" data-year="2023">
                  <div className="card-item-title">
                    Traffitix.ai - <span> AI Engineer </span>
                  </div>
                  <div className="card-item-desc">
                  An AI Vision Based Traffic monitoring system. @Tahaluf UAE
                  </div>
                </div>
                <div className="card-item" data-year="2022">
                  <div className="card-item-title">
                    Initor.ai - <span>AI Engineer</span>
                  </div>
                  <div className="card-item-desc">
                    a Vision Based AI-powered facility monitoring system. @Tahaluf UAE
                  </div>
                </div>
                <div className="card-item" data-year="2019">
                  <div className="card-item-title">
                    Digified.io - <span>ML Engineer</span>
                  </div>
                  <div className="card-item-desc">
                    a Offers a one-stop shop for Digital Identity Verification (e-kyc).
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card-section" id="contact">
            <div className="card-content">
              <div className="card-subtitle">CONTACT</div>
              <div className="card-contact-wrapper">
                <div className="card-contact">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  UAE  ✈  EGYPT
                </div>
                <div className="card-contact">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewbox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  (971) 522902006
                </div>
                <div className="card-contact">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <path d="M22 6l-10 7L2 6" />
                  </svg>
                  a7medhermas@gmail.com
                </div>
              </div>
            </div>
          </div>
          <div className="card-buttons">
            <button data-section="#about" className="is-active">
              ABOUT
            </button>
            <button data-section="#experience">EXPERIENCE</button>
            <button data-section="#contact">CONTACT</button>
          </div>
        </div>
      </div>
    </>
  );
};


export default Home;
