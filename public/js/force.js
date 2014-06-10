'use strict';


var BubbleChart, root,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

BubbleChart = (function() {
  function BubbleChart(data, nameTitle) {
    this.start = __bind(this.start, this);
    this.createVis = __bind(this.createVis, this);
    this.createNodes = __bind(this.createNodes, this);
    this.data = data;
    this.nameTitle = nameTitle || 'Phrase';

    var vis = $('.container');

    this.width = vis.width();
    this.height = window.innerHeight - 50;
    this.clamp = d3.min([this.width, this.height]);
    this.tooltip = CustomTooltip('fwordTooltip', 240);
    this.center = {
      x: this.width / 2,
      y: this.height / 2
    };
    this.layoutGravity = -0.01;
    this.damper = 0.1;
    this.vis = null;
    this.nodes = [];
    this.force = null;
    this.circles = null;
    this.fillColor = d3.hsl('#496282');
    this.maxAmount = d3.max(this.data, function(d) {
      return d.count;
    });
    this.minAmount = d3.min(this.data, function(d) {
      return d.count;
    });
    this.radiusScale = d3.scale.pow().exponent(0.5).domain([this.minAmount, this.maxAmount]).range([2, this.clamp/12]);
    this.lightenScale = d3.scale.linear().domain([this.minAmount, this.maxAmount]).range([2, 0]);
    this.createNodes();
    this.createVis();
  }

  BubbleChart.prototype.createNodes = function() {
    this.data.forEach(function(d, i) {
        var node;
        node = {
          id: i,
          radius: this.radiusScale(d.count),
          value: d.count,
          name: d.name,
          x: Math.random() * 900,
          y: Math.random() * 800
        };
        return this.nodes.push(node);
      }, this);
    return this.nodes.sort(function(a, b) {
      return b.value - a.value;
    });
  };

  BubbleChart.prototype.createVis = function() {
    var self = this;
    this.vis = d3.select('#vis').append('svg')
                .attr('width', this.width)
                .attr('height', this.height)
                .attr('id', 'svg_vis');
    this.circles = this.vis.selectAll('circle')
          .data(this.nodes);
    this.circles.enter()
        .append('circle')
        .attr('r', 0)
        .style('fill', function(d) {
          var brightFactor = self.lightenScale(d.value);
          var color = self.fillColor.brighter(brightFactor);
          return color;
        })
        .attr('stroke-width', 2).attr('stroke', function(d) {
          return self.fillColor.brighter(self.lightenScale(d.value)).darker();
        })
        .attr('id', function(d) {
          return 'bubble_' + d.id;
        }).on('mouseover', function(d, i) {
          return self.showDetails(d, i, this);
    }).on('mouseout', function(d, i) {
      return self.hideDetails(d, i, this);
    });
    return this.circles.transition().duration(2000).attr('r', function(d) {
      return d.radius;
    });
  };

  BubbleChart.prototype.charge = function(d) {
    return -Math.pow(d.radius, 2.0) / 8;
  };

  BubbleChart.prototype.start = function() {
    return this.force = d3.layout.force().nodes(this.nodes).size([this.width, this.height]);
  };

  BubbleChart.prototype.display_group_all = function() {
    this.force.gravity(this.layoutGravity).charge(this.charge).friction(0.9).on('tick', (function(_this) {
      return function(e) {
        return _this.circles.each(_this.move_towards_center(e.alpha)).attr('cx', function(d) {
          return d.x;
        }).attr('cy', function(d) {
          return d.y;
        });
      };
    })(this));
    this.force.start();
    return this.hide_years();
  };

  BubbleChart.prototype.move_towards_center = function(alpha) {
    return (function(_this) {
      return function(d) {
        d.x = d.x + (_this.center.x - d.x) * (_this.damper + 0.02) * alpha;
        return d.y = d.y + (_this.center.y - d.y) * (_this.damper + 0.02) * alpha;
      };
    })(this);
  };

  BubbleChart.prototype.display_by_year = function() {
    this.force.gravity(this.layoutGravity).charge(this.charge).friction(0.9).on('tick', (function(_this) {
      return function(e) {
        return _this.circles.each(_this.move_towards_year(e.alpha)).attr('cx', function(d) {
          return d.x;
        }).attr('cy', function(d) {
          return d.y;
        });
      };
    })(this));
    this.force.start();
    return this.display_years();
  };

  BubbleChart.prototype.move_towards_year = function(alpha) {
    return (function(_this) {
      return function(d) {
        var target;
        target = _this.year_centers[d.year];
        d.x = d.x + (target.x - d.x) * (_this.damper + 0.02) * alpha * 1.1;
        return d.y = d.y + (target.y - d.y) * (_this.damper + 0.02) * alpha * 1.1;
      };
    })(this);
  };

  BubbleChart.prototype.display_years = function() {
    var years, years_data, years_x;
    years_x = {
      '2008': 160,
      '2009': this.width / 2,
      '2010': this.width - 160
    };
    years_data = d3.keys(years_x);
    years = this.vis.selectAll('.years').data(years_data);
    return years.enter().append('text').attr('class', 'years').attr('x', (function(_this) {
      return function(d) {
        return years_x[d];
      };
    })(this)).attr('y', 40).attr('text-anchor', 'middle').text(function(d) {
      return d;
    });
  };

  BubbleChart.prototype.hide_years = function() {
    var years;
    return years = this.vis.selectAll('.years').remove();
  };

  BubbleChart.prototype.showDetails = function(data, i, element) {
    var content;
    d3.select(element).attr('stroke', 'black');
    content = '<span class=\'fuckName\'>' + data.name + '</span><br/>';
    content += '<span class=\'name\'>Fucks Given:</span><span class=\'value\'> ' + data.value + '</span><br/>';
    return this.tooltip.showTooltip(content, d3.event);
  };

  BubbleChart.prototype.hideDetails = function(data, i, element) {
    var self = this;
    d3.select(element).attr('stroke', function(d) {
      return self.fillColor.brighter(self.lightenScale(d.value)).darker();
    });
    return this.tooltip.hideTooltip();
  };

  return BubbleChart;

})();

root = typeof exports !== 'undefined' && exports !== null ? exports : this;

$(function() {
  var chart, render;
  chart = null;
  render = function(json, nameTitle) {
    chart = new BubbleChart(json, nameTitle);
    chart.start();
    return root.display_all();
  };
  root.display_all = (function(_this) {
    return function() {
      return chart.display_group_all();
    };
  })(this);
  root.display_year = (function(_this) {
    return function() {
      return chart.display_by_year();
    };
  })(this);
  root.toggle_view = (function(_this) {
    return function(view_type) {
      if (view_type === 'year') {
        return root.display_year();
      } else {
        return root.display_all();
      }
    };
  })(this);
  var nodes = [],
    links = [], 
    trimPercent = 0;
  function getData(endpoint) {
    $.ajax('api/' + endpoint)
    .done(function(data) {
      var d, n;
      var nameTitle, countTitle;
      if(data.ngrams) {
        nameTitle = 'Phrase';
        d = data.ngrams.sort(function(a,b) {
          return b.tf - a.tf;
        });
      } else {
        nameTitle = 'Author';
        d = data.sort(function(a,b) {
          return b.total - a.total;
        });
      }
      n = _.first(d, 1000);
      nodes = _.map(n, function(d) {
        if(d.term) {
          return { name: d.term, count: d.tf };  
        } else {
          return {name: d.name, count: d.total};
        }
        
      });
      
      render(nodes, nameTitle);
    })
    .error(function(err) {
      console.error('error!:', err);
    });
  }
  getData('');
  $('[data-api]').click(function(evt) {
    $('#fwordTooltip').remove();
    d3.select("svg")
       .remove();
    $('#apiSelector li').removeClass('active');
    $(evt.target.parentElement).addClass('active');
    var endpoint = $(evt.target).data('api');
    getData(endpoint);
  });
});
