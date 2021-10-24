var srcTimeout;

var TWO_PI = Math.PI*2;
var circleCanvas = document.createElement('canvas');
var circleCtx = circleCanvas.getContext('2d');
circleCanvas.width = 21;
circleCanvas.height = 21;
circleCtx.beginPath()
circleCtx.arc(circleCanvas.width/2, circleCanvas.height/2, circleCanvas.width/2, 0, TWO_PI, false);
circleCtx.fill();

var halo = false;
var sprite = false;

var detail = 2;

var ExperimentParticle = function(data, position) {

  position[0] += 8;
  position[1] -= 13;

  this.clicks = 0;

  this.position = position;

  this.data = data;
  this.naturalTargetRadius = this.targetRadius = Math.random()*4 + 1;
  this.radius = 0;
  
  this.title = this.data.name.replace(' ', '&nbsp;');
  this.authorName = this.data.author.name.replace(' ', '&nbsp;');

  this.anchor = physics.makeParticle(1, 0, 0, 0);
  this.anchor.makeFixed();
  this.restorePosition();

  this.added = false;
  this.appear = (this.data.date - first)/realDur*dur;
  
  this.mass = this.targetRadius/4+1;

  this.targetMaxVel = this.restMaxVel = 5;
  this.maxVel = 5;

  this.index = ExperimentParticle.all.length;

  var date = new Date(this.data.date);
  this.month = date.getFullYear()*12+date.getMonth() - firstMonth;
  this.date = date.getDate();
  // firstMonth = );

  this.formattedDate = dateFormat(this.data.date, 'fullDate');

  this.coloredTags = []

  _.each(this.data.tags, function(t) {
    var c = tags[t][0];
    var bw = tags[t][1] ? '#000' : '#fff';
    this.coloredTags.push('<span class="tag" style="background-color:'+c+'; color:'+bw+'">'+t+'</span>');
  }, this)

  if (this.data.webgl) {
    this._draw = function() {
      var radius = this.radius*1.5;
      var x = this.particle.position.x;
      var y = this.particle.position.y;
      ctx.save();
      ctx.translate(this.particle.position.x, this.particle.position.y);
      ctx.rotate(Math.PI/4);
      ctx.globalAlpha = this.over && this.soloed ? 0.6 : 1;
      ctx.fillRect(-radius/2, -radius/2, radius, radius);
      ctx.restore();
      // if (this.over) {

      //   ctx.save();
      //   ctx.beginPath();
      //   ctx.moveTo(x-radius/2, y);
      //   ctx.lineTo(x, y-radius/2);
      //   ctx.lineTo(x+radius/2, y);
      //   ctx.lineTo(x, y+radius/2);

      //   ctx.clip();
      //   this.drawNumber();
      //   ctx.restore();
      // }
    }
  } else { 
    this._draw = function() {
      if (!this.over && halo) {
        ctx.globalAlpha = 0.05;
        circle(this.particle.position.x, this.particle.position.y, this.radius*3, sprite);
      }
      ctx.globalAlpha = this.over && this.soloed ? 0.6 : 1;
      circle(this.particle.position.x, this.particle.position.y, this.radius, sprite && !this.over);
      // if (this.over) {
      //   ctx.save();
      //   circle(this.particle.position.x, this.particle.position.y, this.radius, true);
      //   this.drawNumber();
      //   ctx.restore();
      // }
    }
  }

  ExperimentParticle.all.push(this);

};

ExperimentParticle.all = [];
ExperimentParticle.added = 0;

ExperimentParticle.prototype.drawNumber = function() {
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillText(this.index+1, this.particle.position.x, this.particle.position.y+4); 
  ctx.fillStyle = '#fff';
  ctx.fillText(this.index+1, this.particle.position.x, this.particle.position.y+3); 
}

ExperimentParticle.prototype.distanceSquaredToMouse = function() {

  if (!this.particle) return Infinity;
  if (activeFilter && !this.soloed) return Infinity;
  return this.particle.position.distanceSquaredTo(mouseParticle.position);

};

ExperimentParticle.prototype.add = function() {

  if (this.index % 10 == 0) sfx.pop();
  this.added = true;

  var x = this.position[0];
  var y = this.position[1];
  this.particle = physics.makeParticle(this.mass, 0,0,0);
  this.particle.position.x = x+(Math.random()-Math.random())*20;
  this.particle.position.y = y+(Math.random()-Math.random())*20, 0
  this.particle.velocity.x += (Math.random()-Math.random())*3;
  this.particle.velocity.y += (Math.random()-Math.random())*3;

  this.spring = physics.makeSpring(this.anchor, this.particle, restConstant, restDamping, 0);

  // _.each(physics.particles, function(p, i) {
  //   if (i % 20 != 0) return;
  //   if (p == mouseParticle) return;
  //   // physics.makeAttraction(this.particle, p, -0.5, 1);
  // }, this);

  this.repelMouse = physics.makeAttraction(this.particle, mouseParticle, restRepulsion, 10);

  ExperimentParticle.added++;
  if (ExperimentParticle.added == ExperimentParticle.all.length) {
    onAllAdded();
  }

};

ExperimentParticle.prototype.restorePosition = function() {
  this.anchor.position.x = this.position[0];
  this.anchor.position.y = this.position[1];
};

ExperimentParticle.prototype.chrono = function() {
  clearTimeout(this.chronoTimeout);
  this.spring.constant = 0.1;
  this.spring.damping = 0.2;
  // this.particle.mass = 0.1;
  this.targetMaxVel = this.maxVel = 500;
  this.repelMouse.constant = -0.2;
  this.anchor.position.y = Math.floor(this.index/50)*20*0.8 + 45;
  this.anchor.position.x = this.index%50*14*0.72;
  this.pnaturalTargetRadius = this.naturalTargetRadius;
  this.naturalTargetRadius = 2;
}

ExperimentParticle.prototype.unchrono = function() {
  this.restorePosition();
  var _this = this;
  
  var x = this.position[0];
  var y = this.position[1];
  
  this.particle.velocity.x += (Math.random()-Math.random())*0.3;
  this.particle.velocity.y += (Math.random()-Math.random())*0.3;
  this.spring.damping = restDamping;  
  this.targetMaxVel = this.restMaxVel;

  clearTimeout(this.chronoTimeout);
  this.chronoTimeout = setTimeout(function() {
    _this.spring.constant = restConstant;
    _this.particle.mass = _this.mass;
    _this.repelMouse.constant = restRepulsion;
  }, 800);
  
  this.naturalTargetRadius = this.pnaturalTargetRadius;
}

ExperimentParticle.prototype.mouseOver = function() {

  sfx.pop();

  this.over = true;
  this.targetRadius = 50;
  this.particle.makeFixed();

  domExperiment.classList.add('showing');
  document.body.classList.add('showing-experiment');  
  document.body.style.cursor = 'pointer';


  // domExperiment.innerHTML = JSON.stringify(this.data);

  domIndex.innerHTML = this.index+1;
  domTitle.innerHTML = this.title;
  // domAuthor.href = this.data.author.url;
  domImage.onload = function(){};
  domImage.src = 'images/trans.gif';
  var _this = this;
  clearTimeout(srcTimeout);
  srcTimeout = setTimeout(function() {
    domImage.onload = function() {
      domImageContainer.classList.add('loaded');
    };
    domImage.src = 'data/images/'+_this.data.id+'.jpg';
  }, 50);
  
  domAuthor.innerHTML = this.authorName;
  domLocation.innerHTML = this.data.author.location;
  domDate.innerHTML = this.formattedDate;
  domTags.innerHTML = this.coloredTags.join(' ');

};

ExperimentParticle.prototype.click = function() {

  this.clicks++;
  if (!hasHover && this.clicks < 2) return;

  var padding = 10;
  var w = window.outerWidth - padding*2;
  var h = window.outerHeight - padding*2 - 50;
  var x = (window.screenLeft || window.screenX) + padding;
  var y = (window.screenTop || window.screenY) + padding;

  var popupStr = 'width='+w+',height='+h+',left='+x+',top='+y+',location=no,status=no,menubar=no,toolbar=no,directories=no';

  window.open(this.data.url, 'popup');
  this.mouseOut();

};


ExperimentParticle.prototype.mouseOut = function() {

  this.clicks = 0;

  this.over = false;
  domIndex.innerHTML    = '';
  domTitle.innerHTML    = '';
  // domAuthor.href     = '';
  domAuthor.innerHTML   = '';
  domLocation.innerHTML = '';
  domTags.innerHTML     = '';
  domDate.innerHTML     = '';

  domExperiment.classList.remove('showing');
  document.body.classList.remove('showing-experiment');
  document.body.style.cursor = '';

  domImageContainer.classList.remove('loaded');

  this.targetRadius = this.naturalTargetRadius;
  this.particle.fixed = false;
};

ExperimentParticle.prototype.update = function(time) {
  if (!this.added) {
    if (time > this.appear) {
      this.add();
    } else {
      return;
    }
  }
  var l =this.particle.velocity.lengthSquared();
  if (l > this.maxVel) {
    this.particle.velocity.scale(this.maxVel/l);
  }
  this.radius += (this.targetRadius - this.radius)*0.35;
  this.maxVel += (this.targetMaxVel - this.maxVel)*0.1;
};

ExperimentParticle.prototype.solo = function() {
  this.soloed = true;
};

ExperimentParticle.prototype.unsolo = function() {
  this.soloed = false;
};

ExperimentParticle.prototype.getNaturalColor = function() {
  return this.data.tags.length ? tags[this.data.tags[0]][0] : '#222';
};

ExperimentParticle.prototype.draw = function() {

  if (!this.added) return;

  var color;
  if (activeFilter) {

    // var tagged = this.data.tags.indexOf(tag) > -1 ;
    var tColor = tags[activeFilter.tag] ? tags[activeFilter.tag][0] : false;
    color = this.soloed ? tColor || this.getNaturalColor() : '#eee';

    if (!this.soloed) {
      this.targetRadius = 1;
    } else {
      if (!this.over) this.targetRadius = this.naturalTargetRadius;
    }

  } else {
    color = this.getNaturalColor();
    if (!this.over) this.targetRadius = this.naturalTargetRadius;
  } 

  ctx.fillStyle = color;
  ctx.strokeStyle = ctx.fillStyle;
  this._draw();
};

function circle(x, y, r, fast) {
  if (fast) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(r/circleCanvas.width*2, r/circleCanvas.width*2)
    ctx.drawImage(circleCanvas, -circleCanvas.width/2, -circleCanvas.height/2);
    ctx.restore();
  } else { 
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TWO_PI, false);
    ctx.fill();
  }
}
