class Firework {
    constructor(ctx, canvasWidth, canvasHeight) {
      this.ctx = ctx;
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.reset();
    }
  
    reset() {
      this.x = Math.random() * this.canvasWidth;
      this.y = this.canvasHeight;
      
      // Enhanced color patterns
      this.colorType = Math.random();
      if (this.colorType < 0.3) {
        // Gold and silver for elegance
        this.color = `hsl(${Math.random() < 0.5 ? 45 : 0}, ${Math.random() * 20 + 80}%, ${Math.random() * 20 + 60}%)`;
      } else if (this.colorType < 0.6) {
        // Vibrant rainbow
        this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
      } else {
        // Complementary colors
        const baseHue = Math.random() * 360;
        this.color = `hsl(${baseHue}, 100%, 60%)`;
        this.complementaryColor = `hsl(${(baseHue + 180) % 360}, 100%, 60%)`;
      }
  
      // Variable launch speed and trajectory
      this.dx = (Math.random() - 0.5) * 4;
      this.dy = -(Math.random() * 12 + 11);
      this.gravity = 0.18;
      this.windEffect = (Math.random() - 0.5) * 0.05;
      
      this.exploded = false;
      this.particles = [];
      this.sparkles = [];
      this.age = 0;
      
      // Different explosion patterns
      this.explosionType = Math.floor(Math.random() * 4);
    }
  
    launch() {
      // Add wind effect
      this.dx += this.windEffect;
      this.x += this.dx;
      this.y += this.dy;
      this.dy += this.gravity * 0.7;
  
      // Shimmering launch trail
      const trailLength = 5;
      for (let i = 0; i < trailLength; i++) {
        const alpha = 1 - (i / trailLength);
        const offset = i * 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x - this.dx * offset, this.y - this.dy * offset);
        this.ctx.lineTo(this.x - this.dx * (offset + 2), this.y - this.dy * (offset + 2));
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
  
      // Random sparkles during launch
      if (Math.random() < 0.3) {
        this.sparkles.push({
          x: this.x,
          y: this.y,
          size: Math.random() * 2,
          alpha: 1
        });
      }
  
      // Explosion trigger
      if (this.dy >= -2 || this.y <= this.canvasHeight * 0.2) {
        this.explode();
      }
    }
  
    explode() {
      const baseParticleCount = 80;
      let particleCount;
      
      switch (this.explosionType) {
        case 0: // Circular burst
          particleCount = baseParticleCount;
          for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = Math.random() * 3 + 4;
            this.createParticle(angle, speed);
          }
          break;
          
        case 1: // Double ring
          for (let ring = 0; ring < 2; ring++) {
            const radius = ring === 0 ? 3 : 5;
            for (let i = 0; i < baseParticleCount; i++) {
              const angle = (i / baseParticleCount) * Math.PI * 2;
              this.createParticle(angle, radius);
            }
          }
          break;
          
        case 2: // Heart shape
          for (let i = 0; i < baseParticleCount * 1.5; i++) {
            const a = (i / baseParticleCount) * Math.PI * 2;
            const r = (Math.sin(a) * Math.sqrt(Math.abs(Math.cos(a)))) / (Math.sin(a) + 1.4) * 15;
            const x = r * Math.cos(a);
            const y = -r * Math.sin(a);
            const angle = Math.atan2(y, x);
            const speed = Math.sqrt(x * x + y * y) * 0.5;
            this.createParticle(angle, speed);
          }
          break;
          
        case 3: // Spiral
          for (let i = 0; i < baseParticleCount * 2; i++) {
            const angle = (i / baseParticleCount) * Math.PI * 8;
            const radius = (i / baseParticleCount) * 5;
            this.createParticle(angle, radius);
          }
          break;
      }
      
      this.exploded = true;
    }
  
    createParticle(angle, speed) {
      const color = this.colorType >= 0.6 && Math.random() < 0.5 
        ? this.complementaryColor 
        : this.color;
        
      this.particles.push({
        x: this.x,
        y: this.y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 2,
        alpha: 1,
        color: color,
        trail: [{ x: this.x, y: this.y }],
        maxTrailLength: Math.floor(Math.random() * 10) + 5,
        decay: Math.random() * 0.02 + 0.015
      });
    }
  
    updateParticles() {
      // Update particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const particle = this.particles[i];
        
        particle.x += particle.dx;
        particle.y += particle.dy;
        particle.dy += this.gravity;
        particle.dx *= 0.99;
        
        // Shimmer effect
        particle.size *= 0.96;
        
        // Trail effect
        particle.trail.push({ x: particle.x, y: particle.y });
        if (particle.trail.length > particle.maxTrailLength) {
          particle.trail.shift();
        }
        
        // Draw particle trail with gradient
        if (particle.trail.length > 1) {
          const gradient = this.ctx.createLinearGradient(
            particle.trail[0].x, particle.trail[0].y,
            particle.x, particle.y
          );
          gradient.addColorStop(0, `rgba(${this.getRGB(particle.color)}, 0)`);
          gradient.addColorStop(1, `rgba(${this.getRGB(particle.color)}, ${particle.alpha})`);
          
          this.ctx.beginPath();
          this.ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
          for (let j = 1; j < particle.trail.length; j++) {
            this.ctx.lineTo(particle.trail[j].x, particle.trail[j].y);
          }
          this.ctx.strokeStyle = gradient;
          this.ctx.lineWidth = particle.size;
          this.ctx.stroke();
        }
        
        // Draw particle
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${this.getRGB(particle.color)}, ${particle.alpha})`;
        this.ctx.fill();
        
        // Add sparkle effect
        if (Math.random() < 0.1) {
          this.ctx.beginPath();
          this.ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
          this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha * 0.5})`;
          this.ctx.fill();
        }
        
        particle.alpha -= particle.decay;
        
        if (particle.alpha <= 0) {
          this.particles.splice(i, 1);
        }
      }
      
      // Update sparkles
      for (let i = this.sparkles.length - 1; i >= 0; i--) {
        const sparkle = this.sparkles[i];
        sparkle.alpha -= 0.05;
        
        if (sparkle.alpha > 0) {
          this.ctx.beginPath();
          this.ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
          this.ctx.fillStyle = `rgba(255, 255, 255, ${sparkle.alpha})`;
          this.ctx.fill();
        } else {
          this.sparkles.splice(i, 1);
        }
      }
    }
  
    update() {
      this.age++;
      
      if (!this.exploded) {
        this.launch();
      } else {
        this.updateParticles();
      }
      
      if (this.exploded && this.particles.length === 0 && this.sparkles.length === 0) {
        this.reset();
      }
    }
  
    getRGB(hslColor) {
      const match = hslColor.match(/hsl\((\d+\.?\d*),\s*(\d+)%,\s*(\d+)%\)/);
      if (match) {
        const [_, h, s, l] = match;
        const rgb = this.hslToRgb(parseFloat(h), parseInt(s), parseInt(l));
        return rgb.join(",");
      }
      return "255,255,255";
    }
  
    hslToRgb(h, s, l) {
      s /= 100;
      l /= 100;
      const k = (n) => (n + h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = (n) =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      return [
        Math.round(255 * f(0)),
        Math.round(255 * f(8)),
        Math.round(255 * f(4))
      ];
    }
  }
  
  class FireworksDisplay {
    constructor() {
      this.canvas = document.getElementById("fireworks-canvas");
      this.ctx = this.canvas.getContext("2d");
      this.resize();
      
      // Increase number of simultaneous fireworks
      this.fireworks = [];
      for (let i = 0; i < 5; i++) {
        this.fireworks.push(
          new Firework(this.ctx, this.canvas.width, this.canvas.height)
        );
      }
      
      window.addEventListener("resize", () => this.resize());
      this.animate();
    }
  
    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  
    animate() {
      // Darker background fade for better contrast
    //   this.ctx.fillStyle = "rgba(7, 7, 48, 0.2)";
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.fireworks.forEach((firework) => firework.update());
      
      requestAnimationFrame(() => this.animate());
    }
  }
  
  // Initialize on page load
  new FireworksDisplay();