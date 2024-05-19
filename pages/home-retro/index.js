import React, { useEffect } from 'react';
import { TimelineMax, TweenLite, Power2, Power3 } from 'gsap';

const Home = () => {
  useEffect(() => {
    const grid = document.querySelector('.m-grid');
    const tl = new TimelineMax();

    TweenLite.set(grid, {
      transformPerspective: 400,
      transformOrigin: '50% 50%',
    });

    const anim2Props = {
      rotationX: 75,
      y: '0%',
      ease: Power2.easeIn,
      transformPerspective: 300,
      onComplete: () => grid.classList.add('is-animating')
    };

    tl
      .to(grid, 1, { scaleY: 1.5, ease: Power3.easeIn })
      .to(grid, 1, anim2Props, '+=0.3')
      .to('.m-logo__wrap', 1, { scale: 1 });

    return () => tl.kill();
  }, []);

  return (
    <div className="wrapper">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css?family=Monoton|Press+Start+2P|Mr+Dafoe|Changa+One');

        .wrapper {
          width: 100%;
          height: 100vh;
          min-height: 400px;
          overflow: hidden;
          filter: blur(1px);
          background: #000;
          background-image: linear-gradient(to bottom, #6a0275 10%, #040c4a 60%);
        }

        .m-grid {
          position: absolute;
          top: 50%;
          margin-top: -75vh;
          left: 50%;
          margin-left: -100vw;
          width: 200vw;
          height: 150vh;
          transform: scaleY(0);
          background-size: 50px 50px;
          background-image: linear-gradient(
              0deg,
              transparent 24%,
              rgba(236, 0, 140, 0.5) 25%,
              rgba(236, 0, 140, 0.9) 26%,
              transparent 27%,
              transparent 74%,
              rgba(236, 0, 140, 0.5) 75%,
              rgba(236, 0, 140, 0.9) 76%,
              transparent 77%,
              transparent
            ),
            linear-gradient(
              90deg,
              transparent 24%,
              rgba(236, 0, 140, 0.75) 25%,
              rgba(236, 0, 140, 0.25) 26%,
              transparent 27%,
              transparent 74%,
              rgba(236, 0, 140, 0.75) 75%,
              rgba(236, 0, 140, 0.25) 76%,
              transparent 77%,
              transparent
            );
        }

        .m-logo {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
          z-index: 501;
        }

        .m-logo__wrap {
          transform: scale(0);
          text-align: center;
        }

        h1 {
          font-family: 'Press Start 2P', sans-serif;
          font-size: 62px;
          letter-spacing: -4px;
          font-weight: 400;
          margin: 0 0 0.25em;
          line-height: 1.25;
          background-image: linear-gradient(top, #3fa8c6 0%, #3fa8c6 0%, #ff9ab2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          color: #ec008c;
          font-size: 50px;
          margin: 0;
          font-family: 'Mr Dafoe', serif;
          text-shadow: 0 1px 0 darken(#ec008c, 30%);
        }

        .m-grid.is-animating {
          animation: fly 1s linear infinite;
        }

        @keyframes fly {
          0% {
            transform: perspective(300px) rotateX(80deg) translateY(0%);
          }
          100% {
            transform: perspective(300px) rotateX(80deg) translateY(50px);
          }
        }
      `}</style>
      <div className="m-grid"></div>
      <div className="m-logo">
        <div className="m-logo__wrap">
          <h1>Hermas.ai</h1>
          <div className="subtitle">Demos are done here</div>
        </div>
      </div>
    </div>
  );
};

export default Home;