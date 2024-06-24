"use client";

import { useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function Page() {
  useEffect(() => {
    !(function (a, b) {
      "use strict";
      function c(a) {
        a = a || {};
        for (var b = 1; b < arguments.length; b++) {
          var c = arguments[b];
          if (c)
            for (var d in c)
              c.hasOwnProperty(d) &&
                ("object" == typeof c[d] ? deepExtend(a[d], c[d]) : (a[d] = c[d]));
        }
        return a;
      }
      function d(d, g) {
        function h() {
          if (y) {
            (r = b.createElement("canvas")),
              (r.className = "pg-canvas"),
              (r.style.display = "block"),
              d.insertBefore(r, d.firstChild),
              (s = r.getContext("2d")),
              i();
            for (var c = Math.round((r.width * r.height) / g.density), e = 0; c > e; e++) {
              var f = new n();
              f.setStackPos(e), z.push(f);
            }
            a.addEventListener(
              "resize",
              function () {
                k();
              },
              !1
            ),
              D &&
                !C &&
                a.addEventListener(
                  "deviceorientation",
                  function () {
                    (F = Math.min(Math.max(-event.beta, -30), 30)),
                      (E = Math.min(Math.max(-event.gamma, -30), 30));
                  },
                  !0
                ),
              j(),
              q("onInit");
          }
        }
        function i() {
          (r.width = d.offsetWidth),
            (r.height = d.offsetHeight),
            (s.fillStyle = g.dotColor),
            (s.strokeStyle = g.lineColor),
            (s.lineWidth = g.lineWidth);
        }
        function j() {
          if (y) {
            (u = a.innerWidth), (v = a.innerHeight), s.clearRect(0, 0, r.width, r.height);
            for (var b = 0; b < z.length; b++) z[b].updatePosition();
            for (var b = 0; b < z.length; b++) z[b].draw();
            G || (t = requestAnimationFrame(j));
          }
        }
        function k() {
          i();
          for (var a = d.offsetWidth, b = d.offsetHeight, c = z.length - 1; c >= 0; c--)
            (z[c].position.x > a || z[c].position.y > b) && z.splice(c, 1);
          var e = Math.round((r.width * r.height) / g.density);
          if (e > z.length)
            for (; e > z.length; ) {
              var f = new n();
              z.push(f);
            }
          else e < z.length && z.splice(e);
          for (c = z.length - 1; c >= 0; c--) z[c].setStackPos(c);
        }
        function l() {
          G = !0;
        }
        function m() {
          (G = !1), j();
        }
        function n() {
          switch (
            (this.stackPos,
            (this.active = !0),
            (this.layer = Math.ceil(3 * Math.random())),
            (this.parallaxOffsetX = 0),
            (this.parallaxOffsetY = 0),
            (this.position = {
              x: Math.ceil(Math.random() * r.width),
              y: Math.ceil(Math.random() * r.height),
            }),
            (this.speed = {}),
            g.directionX)
          ) {
            case "left":
              this.speed.x = +(-g.maxSpeedX + Math.random() * g.maxSpeedX - g.minSpeedX).toFixed(2);
              break;
            case "right":
              this.speed.x = +(Math.random() * g.maxSpeedX + g.minSpeedX).toFixed(2);
              break;
            default:
              (this.speed.x = +(-g.maxSpeedX / 2 + Math.random() * g.maxSpeedX).toFixed(2)),
                (this.speed.x += this.speed.x > 0 ? g.minSpeedX : -g.minSpeedX);
          }
          switch (g.directionY) {
            case "up":
              this.speed.y = +(-g.maxSpeedY + Math.random() * g.maxSpeedY - g.minSpeedY).toFixed(2);
              break;
            case "down":
              this.speed.y = +(Math.random() * g.maxSpeedY + g.minSpeedY).toFixed(2);
              break;
            default:
              (this.speed.y = +(-g.maxSpeedY / 2 + Math.random() * g.maxSpeedY).toFixed(2)),
                (this.speed.x += this.speed.y > 0 ? g.minSpeedY : -g.minSpeedY);
          }
        }
        function o(a, b) {
          return b ? void (g[a] = b) : g[a];
        }
        function p() {
          console.log("destroy"),
            r.parentNode.removeChild(r),
            q("onDestroy"),
            f && f(d).removeData("plugin_" + e);
        }
        function q(a) {
          void 0 !== g[a] && g[a].call(d);
        }
        var r,
          s,
          t,
          u,
          v,
          w,
          x,
          y = !!b.createElement("canvas").getContext,
          z = [],
          A = 0,
          B = 0,
          C = !navigator.userAgent.match(
            /(iPhone|iPod|iPad|Android|BlackBerry|BB10|mobi|tablet|opera mini|nexus 7)/i
          ),
          D = !!a.DeviceOrientationEvent,
          E = 0,
          F = 0,
          G = !1;
        return (
          (g = c({}, a[e].defaults, g)),
          (n.prototype.draw = function () {
            s.beginPath(),
              s.arc(
                this.position.x + this.parallaxOffsetX,
                this.position.y + this.parallaxOffsetY,
                g.particleRadius / 2,
                0,
                2 * Math.PI,
                !0
              ),
              s.closePath(),
              s.fill(),
              s.beginPath();
            for (var a = z.length - 1; a > this.stackPos; a--) {
              var b = z[a],
                c = this.position.x - b.position.x,
                d = this.position.y - b.position.y,
                e = Math.sqrt(c * c + d * d).toFixed(2);
              e < g.proximity &&
                (s.moveTo(
                  this.position.x + this.parallaxOffsetX,
                  this.position.y + this.parallaxOffsetY
                ),
                g.curvedLines
                  ? s.quadraticCurveTo(
                      Math.max(b.position.x, b.position.x),
                      Math.min(b.position.y, b.position.y),
                      b.position.x + b.parallaxOffsetX,
                      b.position.y + b.parallaxOffsetY
                    )
                  : s.lineTo(b.position.x + b.parallaxOffsetX, b.position.y + b.parallaxOffsetY));
            }
            s.stroke(), s.closePath();
          }),
          (n.prototype.updatePosition = function () {
            if (g.parallax) {
              if (D && !C) {
                var a = (u - 0) / 60;
                w = (E - -30) * a + 0;
                var b = (v - 0) / 60;
                x = (F - -30) * b + 0;
              } else (w = A), (x = B);
              (this.parallaxTargX = (w - u / 2) / (g.parallaxMultiplier * this.layer)),
                (this.parallaxOffsetX += (this.parallaxTargX - this.parallaxOffsetX) / 10),
                (this.parallaxTargY = (x - v / 2) / (g.parallaxMultiplier * this.layer)),
                (this.parallaxOffsetY += (this.parallaxTargY - this.parallaxOffsetY) / 10);
            }
            var c = d.offsetWidth,
              e = d.offsetHeight;
            switch (g.directionX) {
              case "left":
                this.position.x + this.speed.x + this.parallaxOffsetX < 0 &&
                  (this.position.x = c - this.parallaxOffsetX);
                break;
              case "right":
                this.position.x + this.speed.x + this.parallaxOffsetX > c &&
                  (this.position.x = 0 - this.parallaxOffsetX);
                break;
              default:
                (this.position.x + this.speed.x + this.parallaxOffsetX > c ||
                  this.position.x + this.speed.x + this.parallaxOffsetX < 0) &&
                  (this.speed.x = -this.speed.x);
            }
            switch (g.directionY) {
              case "up":
                this.position.y + this.speed.y + this.parallaxOffsetY < 0 &&
                  (this.position.y = e - this.parallaxOffsetY);
                break;
              case "down":
                this.position.y + this.speed.y + this.parallaxOffsetY > e &&
                  (this.position.y = 0 - this.parallaxOffsetY);
                break;
              default:
                (this.position.y + this.speed.y + this.parallaxOffsetY > e ||
                  this.position.y + this.speed.y + this.parallaxOffsetY < 0) &&
                  (this.speed.y = -this.speed.y);
            }
            (this.position.x += this.speed.x), (this.position.y += this.speed.y);
          }),
          (n.prototype.setStackPos = function (a) {
            this.stackPos = a;
          }),
          h(),
          { option: o, destroy: p, start: m, pause: l }
        );
      }
      var e = "particleground",
        f = a.jQuery;
      (a[e] = function (a, b) {
        return new d(a, b);
      }),
        (a[e].defaults = {
          minSpeedX: 0.1,
          maxSpeedX: 0.7,
          minSpeedY: 0.1,
          maxSpeedY: 0.7,
          directionX: "center",
          directionY: "center",
          density: 1e4,
          dotColor: "#666666",
          lineColor: "#666666",
          particleRadius: 7,
          lineWidth: 1,
          curvedLines: !1,
          proximity: 100,
          parallax: !0,
          parallaxMultiplier: 5,
          onInit: function () {},
          onDestroy: function () {},
        }),
        f &&
          (f.fn[e] = function (a) {
            if ("string" == typeof arguments[0]) {
              var b,
                c = arguments[0],
                g = Array.prototype.slice.call(arguments, 1);
              return (
                this.each(function () {
                  f.data(this, "plugin_" + e) &&
                    "function" == typeof f.data(this, "plugin_" + e)[c] &&
                    (b = f.data(this, "plugin_" + e)[c].apply(this, g));
                }),
                void 0 !== b ? b : this
              );
            }
            return "object" != typeof a && a
              ? void 0
              : this.each(function () {
                  f.data(this, "plugin_" + e) || f.data(this, "plugin_" + e, new d(this, a));
                });
          });
    })(window, document),
      (function () {
        for (
          var a = 0, b = ["ms", "moz", "webkit", "o"], c = 0;
          c < b.length && !window.requestAnimationFrame;
          ++c
        )
          (window.requestAnimationFrame = window[b[c] + "RequestAnimationFrame"]),
            (window.cancelAnimationFrame =
              window[b[c] + "CancelAnimationFrame"] ||
              window[b[c] + "CancelRequestAnimationFrame"]);
        window.requestAnimationFrame ||
          (window.requestAnimationFrame = function (b) {
            var c = new Date().getTime(),
              d = Math.max(0, 16 - (c - a)),
              e = window.setTimeout(function () {
                b(c + d);
              }, d);
            return (a = c + d), e;
          }),
          window.cancelAnimationFrame ||
            (window.cancelAnimationFrame = function (a) {
              clearTimeout(a);
            });
      })();

    particleground(document.getElementById("particles-foreground"), {
      dotColor: "rgba(255, 255, 255, 1)",
      lineColor: "rgba(255, 255, 255, 0.05)",
      minSpeedX: 0.3,
      maxSpeedX: 0.6,
      minSpeedY: 0.3,
      maxSpeedY: 0.6,
      density: 50000, // One particle every n pixels
      curvedLines: false,
      proximity: 250, // How close two dots need to be before they join
      parallaxMultiplier: 10, // Lower the number is more extreme parallax
      particleRadius: 4, // Dot size
    });

    document.addEventListener("DOMContentLoaded", function () {
      // Create a canvas element dynamically
      var canvas = document.createElement("canvas");
      canvas.style.position = "fixed";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.zIndex = "-1";
      document.body.appendChild(canvas);

      // Resize handler to maintain full screen canvas size
      window.addEventListener("resize", function () {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      });

      // Initialize Particleground on the created canvas
      particleground(canvas, {
        dotColor: "rgba(255, 255, 255, 1)",
        lineColor: "rgba(255, 255, 255, 0.05)",
        minSpeedX: 0.3,
        maxSpeedX: 0.6,
        minSpeedY: 0.3,
        maxSpeedY: 0.6,
        density: 50000, // One particle every n pixels
        curvedLines: false,
        proximity: 250, // How close two dots need to be before they join
        parallaxMultiplier: 10, // Lower the number is more extreme parallax
        particleRadius: 4, // Dot size
      });
    });
  }, []);

  return (
    <>
      <>
        <Navbar />
        <div className="content-wrapper">
          <div className="wrapper">
            <div className="card">
              <img src="https://cdn.dribbble.com/users/307908/screenshots/4449308/big.gif" />
              <div className="info">
                <h1>Face Detection</h1>
                <p>
                  A real time face detection demo served by onnx.js the model runs on the client
                  side.{" "}
                </p>
                <button onClick={() => (window.location.href = "/projects/realtime-face")}>
                  Demo
                </button>
              </div>
            </div>
            <div className="card">
              <img src="https://blogs.mathworks.com/deep-learning/files/2019/01/ball_rolling2.gif.gif" />
              <div className="info">
                <h1>Host a Model</h1>
                <p>serve your AI onnx model and get a UI demo out of the box.</p>
                <button>SOON</button>
              </div>
            </div>
            <div className="card">
              <img src="https://cdn.dribbble.com/users/2681962/screenshots/8971181/media/f0cc14e3d0c4975343da5bd05702a4d0.gif" />
              <div className="info">
                <h1>LLM DEMO</h1>
                <p>
                  This is just a place holder for a really really cool project that is coming soon.
                  Hint : Use me to cheat in your next ?
                </p>
                <button>SOON</button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
        <div id="particles-foreground" className="vertical-centered-box" />
      </>

      <style jsx global>{`
        body {
          -webkit-transform: translate3d(0, 0, 0);
          transform: translate3d(0, 0, 0);
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          -webkit-perspective: 1000;
          top: 0;
          bottom: 0;
          right: 0;
          left: 0;
          position: absolute;
          z-index: -1;
          overflow: hidden;
          background: #2c2d44;
        }
        body .vertical-centered-box {
          position: absolute;
          width: 100%;
          height: 100%;
          text-align: center;
          z-index: -1;
        }
        body .vertical-centered-box:after {
          content: '';
          display: inline-block;
          height: 100%;
          vertical-align: middle;
          margin-right: -0.25em;
        }
        body .vertical-centered-box .content {
          box-sizing: border-box;
          display: inline-block;
          vertical-align: middle;
          text-align: left;
          font-size: 0;
        }
        @font-face {
          font-family: 'Open Sans';
          font-style: normal;
          font-weight: 400;
          font-stretch: normal;
          src: url(https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVc.ttf) format('truetype');
        }
        html {
          height: 100%;
          background-image: linear-gradient(to right top, #8e44ad 0%, #3498db 100%);
        }

        #particles-foreground {
          left: -51%;
          top: -51%;
          width: 202%;
          height: 202%;
          transform: scale3d(0.5, 0.5, 1);
        }
        .content-wrapper {
          overflow-y: auto;
          height: calc(100vh - 60px); /* Adjust based on Navbar and Footer height */
        }
        .wrapper {
          display: flex;
          flex-wrap: wrap;
          width: 90%;
          margin: 0 auto;
          justify-content: space-around;
          flex-direction: row;
          align-items: center;
        }
        .card {
          width: 280px;
          height: 360px;
          border-radius: 15px;
          padding: 1.5rem;
          background: white;
          position: relative;
          display: flex;
          align-items: flex-end;
          transition: 0.4s ease-out;
          box-shadow: 0px 7px 10px rgba(0, 0, 0, 0.5);
          margin: 1rem;
        }
        .card:hover {
          transform: translateY(20px);
        }
        .card:hover:before {
          opacity: 1;
        }
        .card:hover .info {
          opacity: 1;
          transform: translateY(0px);
        }
        .card:before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 15px;
          background: rgba(0, 0, 0, 0.6);
          z-index: 2;
          transition: 0.5s;
          opacity: 0;
        }
        .card img {
          width: 100%;
          height: 100%;
          -o-object-fit: cover;
          object-fit: cover;
          position: absolute;
          top: 0;
          left: 0;
          border-radius: 15px;
        }
        .card .info {
          position: relative;
          z-index: 3;
          color: white;
          opacity: 0;
          transform: translateY(30px);
          transition: 0.5s;
        }
        .card .info h1 {
          margin: 0px;
        }
        .card .info p {
          letter-spacing: 1px;
          font-size: 15px;
          margin-top: 8px;
        }
        .card .info button {
          padding: 0.6rem;
          outline: none;
          border: none;
          border-radius: 3px;
          background: white;
          color: black;
          font-weight: bold;
          cursor: pointer;
          transition: 0.4s ease;
        }
        .card .info button:hover {
          background: dodgerblue;
          color: white;
        }

        @media (max-width: 768px) {
          .wrapper {
            flex-direction: column;
          }
          .card {
            width: 90%;
            margin-bottom: 2rem;
          }
        }

        @media (max-width: 480px) {
          .card {
            width: 100%;
            height: auto;
            padding: 1rem;
          }
          .card .info p {
            font-size: 14px;
          }
        }
      `}</style>
    </>
  );
}
