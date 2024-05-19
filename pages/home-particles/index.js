import React, { useEffect, useRef } from 'react';
import anime from 'animejs';

const HomePage = () => {
  const canvasRef = useRef(null);
  const headlineRef = useRef(null);

  useEffect(() => {
    let max_particles = 200;
    let particles = [];
    let frequency = 1000;
    let init_num = max_particles;
    let max_time = frequency * max_particles;
    let time_to_recreate = false;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Enable repopolate
    setTimeout(function () {
      time_to_recreate = true;
    }, max_time);

    // Popolate particles
    popolate(max_particles);

    class Particle {
      constructor(canvas) {
        let random = Math.random();
        this.progress = 0;
        this.canvas = canvas;
        this.center = {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        };
        this.point_of_attraction = {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        };

        if (Math.random() > 0.5) {
          this.x = window.innerWidth * Math.random();
          this.y =
            Math.random() > 0.5
              ? -Math.random() * 100
              : window.innerHeight + Math.random() * 100;
        } else {
          this.x =
            Math.random() > 0.5
              ? -Math.random() * 100
              : window.innerWidth + Math.random() * 100;
          this.y = window.innerHeight * Math.random();
        }

        this.s = Math.random() * 2;
        this.a = 0;
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        this.radius = random > 0.2 ? Math.random() * 1 : Math.random() * 3;
        this.color = random > 0.2 ? '#694FB9' : '#9B0127';
        this.radius = random > 0.8 ? Math.random() * 2.2 : this.radius;
        this.color = random > 0.8 ? '#3CFBFF' : this.color;
      }

      calculateDistance(v1, v2) {
        let x = Math.abs(v1.x - v2.x);
        let y = Math.abs(v1.y - v2.y);
        return Math.sqrt(x * x + y * y);
      }

      render() {
        this.canvas.beginPath();
        this.canvas.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.canvas.lineWidth = 2;
        this.canvas.fillStyle = this.color;
        this.canvas.fill();
        this.canvas.closePath();
      }

      move() {
        let p1 = {
          x: this.x,
          y: this.y,
        };
        let distance = this.calculateDistance(p1, this.point_of_attraction);
        let force = Math.max(100, 1 + distance);
        let attr_x = (this.point_of_attraction.x - this.x) / force;
        let attr_y = (this.point_of_attraction.y - this.y) / force;
        this.x += Math.cos(this.a) * this.s + attr_x;
        this.y += Math.sin(this.a) * this.s + attr_y;
        this.a += Math.random() > 0.5 ? Math.random() * 0.9 - 0.45 : Math.random() * 0.4 - 0.2;

        // Restrict particle movement within the canvas
        this.x = Math.max(this.radius, Math.min(this.x, canvas.width - this.radius));
        this.y = Math.max(this.radius, Math.min(this.y, canvas.height - this.radius));

        if (distance < 30 + Math.random() * 100) {
          return false;
        }

        this.render();
        this.progress++;
        return true;
      }
    }

    function popolate(num) {
      for (let i = 0; i < num; i++) {
        setTimeout(function (x) {
          return function () {
            particles.push(new Particle(ctx));
          };
        }(i), frequency * i);
      }
      return particles.length;
    }

    function createSphera() {
      let radius = 180;
      let center = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };
    }

    function clear() {
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
    }

    function update() {
      particles = particles.filter(function (p) {
        return p.move();
      });

      // Recreate particles
      if (time_to_recreate) {
        if (particles.length < init_num) {
          popolate(1);
        }
      }

      clear();
      requestAnimationFrame(update);
    }

    update();

    const headline = headlineRef.current;
    if (headline) {
      const textWrapper = headline.querySelector('.text-wrapper');
      const line1 = headline.querySelector('.line1');
      const line2 = headline.querySelector('.line2');
      const lettersLeft = headline.querySelector('.letters-left');

      anime.timeline()
        .add({
          targets: [line1, line2],
          opacity: [0.5, 1],
          scaleX: [0, 1],
          easing: "easeInOutExpo",
          duration: 700
        })
        .add({
          targets: [line1, line2],
          duration: 600,
          easing: "easeOutExpo",
          translateY: (el, i) => (-0.625 + 0.625 * 2 * i) + "em"
        })
        .add({
          targets: lettersLeft,
          opacity: [0, 1],
          translateX: ["0.5em", 0],
          easing: "easeOutExpo",
          duration: 600,
          offset: '-=300'
        });
    }

    // Clean up function
    return () => {
      cancelAnimationFrame(update);
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array to run the effect only once

  return (
    <div>
      <div className="title">
        <h1 ref={headlineRef} className="ml5">
          <span className="text-wrapper">
            <span className="line line1"></span>
            <span className="letters letters-left">Hermas.ai</span>
            <span className="line line2"></span>
          </span>
        </h1>
        <h3>my virtual garage</h3>
        <div className="buttons">
          <a href="/projects" className="btn btn-2">Projects</a>
          <a href="/contact" className="btn btn-2">Contact</a>
        </div>
      </div>
      <canvas ref={canvasRef} />
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css?family=Montserrat:200,300,400,600');
        @import url('https://fonts.googleapis.com/css?family=Roboto:400,100,900');

        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          width: 100vw;
          height: 100vh;
          background: #000000;
        }

        canvas {
          display: block;
        }

        .ml5 {
          position: relative;
          font-weight: 300;
          font-size: 4.5em;
          color: #eeeeee;
        }

        .ml5 .text-wrapper {
          position: relative;
          display: inline-block;
          padding-top: 0.1em;
          padding-right: 0.05em;
          padding-bottom: 0.15em;
          line-height: 1em;
        }

        .ml5 .line {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          margin: auto;
          height: 3px;
          width: 100%;
          background-color: #eeeeee;
          transform-origin: 0.5 0;
        }

        .ml5 .letters {
          display: inline-block;
          opacity: 0;
        }

        .title {
          z-index: 10;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translateX(-50%) translateY(-50%);
          font-family: 'Montserrat';
          text-align: center;
          width: 100%;
        }

        h3 {
          font-weight: 200;
          font-size: 20px;
          padding: 0;
          margin: 0;
          line-height: 1;
          color: #eeeeee;
          letter-spacing: 2px;
          text-shadow: 0 0 30px #000155;
        }

        .buttons {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          margin-top: 1em;
        }

        .btn {
          box-sizing: inherit;
  transition-property: all;
  transition-duration: .6s;
  transition-timing-function: ease;
  color: #fff;
  cursor: pointer;
  // display: block;
  font-size:16px;
  font-weight: 400;
  line-height: 45px;
  margin: 0 0 2em;
  max-width: 160px; 
  position: relative;
  text-decoration: none;
  text-transform: uppercase;
  width: 100%; 

  
  @media(min-width: 600px) {
      
    margin: 0 1em 2em;
  
    
  }
  
  &:hover { text-decoration: none; }
        }

        .btn-2 {
          letter-spacing: 0;
        }

        .btn-2:hover,
        .btn-2:active {
          letter-spacing: 5px;
        }

        .btn-2::after,
        .btn-2::before {
          backface-visibility: hidden;
          border: 1px solid rgba(255, 255, 255, 0);
          bottom: 0px;
          content: " ";
          display: block;
          margin: 0 auto;
          position: relative;
          transition: all 280ms ease-in-out;
          width: 0;
        }

        .btn-2:hover::after,
        .btn-2:hover::before {
          border-color: #fff;
          transition: width 350ms ease-in-out;
          width: 70%;
        }

        .btn-2:hover::before {
          bottom: auto;
          top: 0;
          width: 70%;
        }
      `}</style>
    </div>
  );
};

export default HomePage;