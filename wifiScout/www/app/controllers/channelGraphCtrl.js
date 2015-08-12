/* Controller for the channel graph view. */
app.controller('channelGraphCtrl', ['$scope', 'accessPoints', 'globalSettings',
  'channelGraphState', 'channelChecker', 'setupService', function($scope,
  accessPoints, globalSettings, channelGraphState, channelChecker, setupService) {

  setupService.ready.then(function() {

    var updateInterval = constants.updateIntervalSlow;

    var prefs = {
      defaultBand: '2_4',              // Band shown on first view open ('2_4' or '5')
      domain2_4: [-1, 15],             // X-scale for 2.4 Ghz band
      domain5: [34, 167],              // X-scale for 5 Ghz band
      range: [constants.noSignal, constants.maxSignal],  // Y-scale for level
      defaultViewportExtent: [34, 66], // 5Ghz nav viewport extent on first view open
      fillShadeFactor: 0.75,           // [0,...1] Determines how light the fill shade is
      labelPadding: 10,                // Pixels between parabola top and label bottom
      disallowedChannelOpacity: 0.35,
      disallowedChannelColor: 'black',
      navPercent: 0.2,                 // The portion of the graphic to be occupied by the navigator pane
      navLeftPercent: 0.2,             // The portion of the navigator to be occupied by the 2.4 Ghz selector
      plotMargins: {
        top: 20,
        bottom: 30,
        left: 60,
        right: 0
      },
      navMargins: {
        top: 1,
        bottom: 18,
        left: 60,
        right: 0
      }
    };

    var spanLen = utils.spanLen,
        toLighterShade = utils.toLighterShade,
        isAllowableChannel = channelChecker.isAllowableChannel,
        generateParabola = utils.generateParabola,
        accessPointSubset = utils.accessPointSubset;

    var selectedMACs = [],
        showAll = true;

    var vis = (function() {
      var vis = {};

      /* Current band being displayed ('2_4' or '5'). */
      var band = undefined;

      /* Namespaces for plot elements, scales, and dimensions. */
      var elem = {}, scales = {}, dim = {};

      vis.init = function() {
        /* Scale to device screen */
        dim.width = $(window).width() * 0.95;
        dim.height = ($(window).height() - $('#top-bar').height()) * 0.95;

        buildPlot();
        buildNav();
        vis.setBand(channelGraphState.band() || prefs.defaultBand);
      };

      /* Select the band to display.
       *
       * @param {string} newBand - Either '2_4' or '5'
       */
      vis.setBand = function(newBand) {
        if (newBand !== band) {
          if (newBand ===  '2_4') {
            elem.nav.right.clip.select('#nav-toggle-right').classed('active', false);
            elem.nav.left.clip.select('#nav-toggle-left').classed('active', true);
          } else if (newBand === '5') {
            elem.nav.left.clip.select('#nav-toggle-left').classed('active', false);
            elem.nav.right.clip.select('#nav-toggle-right').classed('active', true);
          }
          band = newBand;

          elem.plot.clip.selectAll('path').remove();
          elem.plot.clip.selectAll('text').remove();

          rescalePlotXAxis();
          repositionPlotElements();
          vis.update();
        }
      };

      /* Store selected band and viewport location */
      vis.saveState = function() {
        channelGraphState.band(band);
        channelGraphState.viewportExtent(elem.nav.right.viewport.extent());
      };

      /* Pull in new data and update element height */
      vis.update = function() {
        if (! globalSettings.updatesPaused()) {
          accessPoints.getAllInBand('2_4').done(function(data) {
            var selectedData;

            if (showAll) {
              selectedData = data;
            } else {
              selectedData = accessPointSubset(data, selectedMACs);
            }

            if (band === '2_4') {
              updateParabolas('plot', selectedData);
              updateLabels(selectedData);
            }

            updateParabolas('navLeft', selectedData);
          });

          accessPoints.getAllInBand('5').done(function(data) {
            var selectedData;

            if (showAll) {
              selectedData = data;
            } else {
              selectedData = accessPointSubset(data, selectedMACs);
            }

            if (band === '5') {
              updateParabolas('plot', selectedData);
              updateLabels(selectedData);
            }

            updateParabolas('navRight', selectedData);
          });
        }
      };

      vis.destroy = function() {
        d3.select('#plot').selectAll('*').remove();
        d3.select('#nav-left').selectAll('*').remove();
        d3.select('#nav-right').selectAll('*').remove();
      };

      /* Derive plot dimensions and add elements to DOM */
      var buildPlot = function() {
        dim.plot = {};

        /* Dimensions */
        dim.plot.totalHeight = dim.height * (1 - prefs.navPercent);

        dim.plot.margin = prefs.plotMargins;

        dim.plot.width = dim.width - dim.plot.margin.left - dim.plot.margin.right;
        dim.plot.height = dim.plot.totalHeight - dim.plot.margin.top - dim.plot.margin.bottom;

        elem.plot = {};

        /* Container */
        elem.plot.container = d3.select('#plot').classed('chart', true).append('svg')
          .attr('width', dim.width)
          .attr('height', dim.plot.totalHeight)
          .append('g')
            .attr('transform', 'translate(' + dim.plot.margin.left + ',' + dim.plot.margin.top + ')');

        /* Clip-path */
        elem.plot.clip = elem.plot.container.append('g')
          .attr('clip-path', 'url(#plot-clip)')

        elem.plot.clip.append('svg:clipPath')
          .attr('id', 'plot-clip')
          .append('rect')
            .attr({ width: dim.plot.width, height: dim.plot.height });

        scales.plot = {};
        elem.plot.axis = {};

        /* X Axis */
        scales.plot.x = d3.scale.linear()
          .domain(prefs.domain2_4)
          .range([0, dim.plot.width]);

        elem.plot.axis.x = d3.svg.axis()
          .scale(scales.plot.x)
          .orient('bottom')
          .ticks(spanLen(scales.plot.x))
          .tickSize(1);

        elem.plot.container.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + dim.plot.height + ')')
          .call(elem.plot.axis.x);

        /* X Label */
        elem.plot.container.append('text')
          .text(strings.channelGraph.labelX)
          .attr('x', function() {
            return (dim.plot.width / 2) - (this.getBBox().width / 2);
          })
          .attr('y', dim.plot.height + dim.plot.margin.bottom - 1);

        /* Y Axis */
        scales.plot.y = d3.scale.linear()
          .domain(prefs.range)
          .range([dim.plot.height, 0]);

        elem.plot.axis.y = d3.svg.axis()
          .scale(scales.plot.y)
          .orient('left')
          .ticks(8)
          .tickSize(1);

        elem.plot.container.append('g')
          .attr('class', 'y axis')
          .call(elem.plot.axis.y);

        /* Y Label */
        elem.plot.container.append('text')
          .text(strings.channelGraph.labelY)
          .attr('transform', function() {
            return 'rotate(90) translate(' + dim.plot.height/2 + ', ' + this.getBBox().width/2 + ')';
          });
      };

      /* Derive navigator dimensions and add elments to DOM */
      var buildNav = function() {
        dim.nav = {};

        /* Dimensions */
        dim.nav.totalHeight = dim.height * prefs.navPercent;

        dim.nav.margin = prefs.navMargins;

        dim.nav.width = dim.width - dim.nav.margin.left - dim.nav.margin.right;
        dim.nav.height = dim.nav.totalHeight - dim.nav.margin.top - dim.nav.margin.bottom;

        scales.nav = {};

        /* Y Scale */
        scales.nav.y = d3.scale.linear()
          .domain(prefs.range)
          .range([dim.nav.height, 0]);

        /* 2.4 Ghz Portion */
        dim.nav.left = {};

        /* Dimensions */
        dim.nav.left.width = dim.nav.width * prefs.navLeftPercent;
        dim.nav.left.totalWidth = dim.nav.left.width + dim.nav.margin.left;

        elem.nav = {};
        elem.nav.left = {};

        /* Container */
        elem.nav.left.container = d3.select('#nav-left').append('svg')
          .attr('width', dim.nav.left.totalWidth)
          .attr('height', dim.nav.totalHeight)
          .append('g')
            .attr('transform', 'translate(' + dim.nav.margin.left + ',' + dim.nav.margin.top + ')');

        /* Clip-path */
        elem.nav.left.clip = elem.nav.left.container.append('g')
          .attr('clip-path', 'url(#nav-clip-left)')

        elem.nav.left.clip.append('svg:clipPath')
          .attr('id', 'nav-clip-left')
          .append('rect')
            .attr('width', dim.nav.left.width)
            .attr('height', dim.nav.height);

        scales.nav.left = {};

        /* 2.4 Ghz selector */
        elem.nav.left.clip.append('rect')
          .attr('id', 'nav-toggle-left')
          .attr('width', dim.nav.left.width)
          .attr('height', dim.nav.height)

        /* X Scale */
        scales.nav.left.x = d3.scale.linear()
          .domain(prefs.domain2_4)
          .range([0, dim.nav.left.width]);

        /* 5 Ghz Portion */
        dim.nav.right = {};

        /* Dimensions */
        dim.nav.right.width = dim.nav.width * (1 - prefs.navLeftPercent);
        dim.nav.right.totalWidth = dim.nav.right.width + dim.nav.margin.right;

        elem.nav.right = {};

        /* Container */
        elem.nav.right.container = d3.select('#nav-right').append('svg')
          .attr('width', dim.nav.right.totalWidth)
          .attr('height', dim.nav.totalHeight)
          .append('g')
            .classed('navigator', true)
            .attr('transform', 'translate(0, ' + dim.nav.margin.top + ')');

        elem.nav.right.clip = elem.nav.right.container.append('g')
          .attr('clip-path', 'url(#nav-clip-right)');

        elem.nav.right.clip.append('svg:clipPath')
          .attr('id', 'nav-clip-right')
          .append('rect')
            .attr({ width: dim.nav.right.width, height: dim.nav.height });

        scales.nav.right = {};

        scales.nav.right.x = d3.scale.linear()
          .domain(prefs.domain5)
          .range([0, dim.nav.right.width]);


        /* Viewport */
        elem.nav.right.viewport = d3.svg.brush()
          .x(scales.nav.right.x)
          .extent(channelGraphState.viewportExtent() || prefs.defaultViewportExtent)
          .on("brushstart", function() {
            vis.setBand('5');
            repositionViewport();
          })
          .on("brush", function() {
            vis.setBand('5');
            repositionViewport();
            repositionPlotXAxis();
            repositionPlotElements();
          })
          .on("brushend", function() {
            vis.setBand('5');
            repositionViewport();
            repositionPlotXAxis();
            repositionPlotElements();
          });

        elem.nav.right.container.append('g')
          .attr("class", "viewport")
          .call(elem.nav.right.viewport)
            .selectAll('rect')
            .attr("height", dim.nav.height);

        /* The slider the user actually sees */
        elem.nav.right.clip.append('rect')
          .attr('id', 'nav-toggle-right')
          .attr('width', elem.nav.right.container.select('.viewport > .extent').attr('width'))
          .attr('height', dim.nav.height)
          .attr('x', scales.nav.right.x(elem.nav.right.viewport.extent()[0]));

        /* Borders */
        elem.nav.left.container.append('rect')
          .attr('width', dim.nav.left.width - 1)
          .attr('height', dim.nav.height)
          .attr('stroke', 'black')
          .attr('stroke-width', '1')
          .attr('fill', 'transparent')
          .attr('pointer-events', 'none');

        elem.nav.right.container.append('rect')
          .attr('width', dim.nav.right.width - 1)
          .attr('height', dim.nav.height)
          .attr('stroke', 'black')
          .attr('stroke-width', '1')
          .attr('fill', 'transparent')
          .attr('pointer-events', 'none');

        /* Labels */
        elem.nav.left.container.append('text')
          .text(strings.channelGraph.label2_4)
          .attr('y', dim.nav.height + dim.nav.margin.bottom);

        elem.nav.right.container.append('text')
          .text(strings.channelGraph.label5)
          .attr('y', dim.nav.height + dim.nav.margin.bottom);
      };

      /* Move plot elements to match a new viewport extent */
      var repositionPlotElements = function() {
        /* Move parabolas */
        elem.plot.clip.selectAll('path')
          .attr('transform', function(d) {
            return 'translate(' + scales.plot.x(d.channel) + ')';
          });

        /* Move labels */
        elem.plot.clip.selectAll('text')
          .attr('x', function(d) {
            return scales.plot.x(d.channel) - this.getBBox().width / 2;
          });
      };

      /* Move the visible slider to match a new viewport extent */
      var repositionViewport = function() {
        var viewport = elem.nav.right.viewport;

        /* Since d3 doesn't provide a good way to prevent
           brush resizing, we need to manually correct the
           viewport extent in order for it to behave like a slider.
           We also need to make it impossible for the slider
           to leave frame.
        */
        var extentMin = viewport.extent()[0],
            extentMax = viewport.extent()[1],
            domainMin = scales.nav.right.x.domain()[0],
            domainMax = scales.nav.right.x.domain()[1];

        var correctLen = spanLen(prefs.defaultViewportExtent);

        if (spanLen(viewport.extent()) !== correctLen) {
          if (extentMin + correctLen > domainMax) {
            /* Prevent slider from leaving frame to the right */
            viewport.extent([domainMax - correctLen, domainMax]);
          } else if (extentMax - correctLen < domainMin) {
            /* Prevent slider from leaving frame to the left */
            viewport.extent([domainMin, domainMin + correctLen]);
          } else {
            /* Otherwise, simply correct the size */
            viewport.extent([extentMin, extentMin + correctLen]);
          }
        }

        /* Move visible slider to match new viewport extent */
        elem.nav.right.clip.select('#nav-toggle-right')
          .attr('x', scales.nav.right.x(viewport.extent()[0]));
      };

      /* Correct X axis to account for band change */
      var rescalePlotXAxis = function() {
        repositionPlotXAxis();
        elem.plot.axis.x.ticks(spanLen(scales.plot.x.domain()));
        elem.plot.container.select('.x.axis').call(elem.plot.axis.x);
        removeDisallowedChannels();
      };

      /* "Translate" x axis to account for a new viewport extent */
      var repositionPlotXAxis = function() {
        if (band === '2_4') {
          scales.plot.x.domain(prefs.domain2_4);
        } else if (band === '5') {
          scales.plot.x.domain(elem.nav.right.viewport.extent());
        }

        elem.plot.container.select('.x.axis').call(elem.plot.axis.x);
        removeDisallowedChannels();
      };

      /* Remove tick marks from X axis which don't correspond
         to a valid channel */
      var removeDisallowedChannels = function() {
        elem.plot.container.selectAll('.x.axis > .tick')
          .filter(function(d) {
            return isAllowableChannel(d) === undefined;
          })
            .remove();

        elem.plot.container.selectAll('.x.axis > .tick')
          .filter(function(d) {
            return isAllowableChannel(d) === false;
          })
            .style('opacity', prefs.disallowedChannelOpacity)
            .attr('fill', prefs.disallowedChannelColor);
      };

      /* Update labels to account for new data.
       *
       * @param {Array.<APData>} data - the new dataset.
       */
      var updateLabels = function(data) {
        /* Bind new data */
        var labels = elem.plot.clip.selectAll('text')
          .data(data.sort(function(a, b) {
            return b.level - a.level;
          }), function(d) {
            return d.MAC;
          });

        /* Add new labels where necessary */
        labels.enter().append('text')
          .text(function(d) {
            return d.SSID;
          })
          .attr('fill', function(d) {
            return d.color;
          })
          .attr('x', function(d) {
            return scales.plot.x(d.channel) - this.getBBox().width / 2;
          })
          .attr('y', scales.plot.y(constants.noSignal))

        labels.order();

        /* Update existing labels */
        labels
          .transition()
          .duration(updateInterval * 0.8)
            .attr('y', function(d) {
              return scales.plot.y(d.level) - prefs.labelPadding;
            });

        /* Remove labels that no longer belong to any data */
        labels.exit()
        .transition()
        .duration(updateInterval * 0.8)
          .attr('y', scales.plot.y(constants.noSignal))
          .remove();
      };

      /* Update parabolas to account for new data.
       *
       * @param {string} section - The portion of the view in which to update
       *    the parabolas ('plot', 'navLeft', or 'navRight').
       * @param {Array.<APData>} data - the new dataset.
       */
      var updateParabolas = function(section, data) {
        var xScale, yScale, clip;

        if (section === 'plot') {
          xScale = scales.plot.x;
          yScale = scales.plot.y;
          clip = elem.plot.clip;
        } else if (section === 'navLeft') {
          xScale = scales.nav.left.x;
          yScale = scales.nav.y;
          clip = elem.nav.left.clip;
        } else if (section === 'navRight') {
          xScale = scales.nav.right.x;
          yScale = scales.nav.y;
          clip = elem.nav.right.clip;
        } else {
          return;
        }

        /* Bind new data */
        var parabolas = clip.selectAll('path')
          .data(data.sort(function(a, b) {
            return b.level - a.level;
          }), function(d) {
            return d.MAC;
          });

        parabolas.enter().append('path')
          .attr('d', function(d) {
            return generateParabola(constants.noSignal, xScale, yScale);
          })
          .attr('transform', function(d) {
            return 'translate(' + xScale(d.channel) + ')';
          })
          .attr('stroke', function(d) {
            return d.color
          })
          .attr('fill', function(d) {
            return toLighterShade(d.color, prefs.fillShadeFactor);
          })
          .attr('stroke-width', 2);

        parabolas.order();

        parabolas
          .transition()
          .duration(updateInterval * 0.8)
            .attr('d', function(d) {
              return generateParabola(d.level, xScale, yScale);
            });

        parabolas.exit()
          .transition()
          .duration(updateInterval * 0.8)
            .attr('d', function(d) {
              return generateParabola(constants.noSignal, xScale, yScale);
            })
            .remove();
      };

      return vis;
    })();

    $scope.setBand = vis.setBand;

    var updateSelection = function() {
      var selection = globalSettings.getAccessPointSelection('channelGraph');
      selectedMACs = selection.macAddrs;
      showAll = selection.showAll;
    };

    var init = function() {
      vis.init();

      updateSelection();

      var firstUpdate = function() {
        vis.update();
        document.removeEventListener(events.swipeDone, firstUpdate);
      }

      if (globalSettings.updatesPaused()) {
        document.addEventListener(events.swipeDone, firstUpdate);
      } else {
        vis.update();
      }

      var updateLoop = setInterval(vis.update, updateInterval);
      document.addEventListener(events.newAccessPointSelection['channelGraph'], updateSelection);

      /* Runs on view unload */
      $scope.$on('$destroy', function() {
        clearInterval(updateLoop);
        document.removeEventListener(events.newAccessPointSelection['channelGraph'], updateSelection);

        vis.saveState();
        vis.destroy();
      });
    };

    init();

  });
}]);
