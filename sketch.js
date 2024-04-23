let nodes = [];
let bgImage;



function setup() {
    createCanvas(windowWidth, windowHeight);
    for (let i = 0; i < 100; i++) {
        nodes.push(new Node(random(width), random(height)));
    }
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(0, 255, 0);
}

function draw() {
    background(0); // Background color
    for (let i = 0; i < nodes.length; i++) {
        nodes[i].display();
        nodes[i].update();
        connectNodes(nodes[i], nodes);
    }
    fill(255, 0, 255); // Text color
    text('Hermas.ai - Coming Soon', width / 2, height / 2);
}

function connectNodes(node, nodes) {
    stroke(0, 255, 0, 150); // Connection line color and transparency
    nodes.forEach(other => {
        let d = dist(node.x, node.y, other.x, other.y);
        if (d < 150) {
            line(node.x, node.y, other.x, other.y);
        }
    });
}

class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vel = createVector(random(-2, 2), random(-2, 2));
    }

    update() {
        this.x += this.vel.x;
        this.y += this.vel.y;
        this.edges();
    }

    display() {
        noStroke();
        fill(0, 255, 0); // Node color
        ellipse(this.x, this.y, 10, 10); // Node size
    }

    edges() {
        if (this.x < 0 || this.x > width) {
            this.vel.x *= -1;
        }
        if (this.y < 0 || this.y > height) {
            this.vel.y *= -1;
        }
    }
}
