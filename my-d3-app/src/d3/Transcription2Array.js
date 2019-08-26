import React, { Component } from "react";
import * as d3 from "d3";
// import sp500 from "./sp500.csv";
import "./Transcription2.css";

export default class Transcription2Array extends Component {
  // state = {
  //   dnaSeq:
  //     "ATATATAGACCCGCATATATATGCAGAGGAGATTATATAGAGGAGACACACACCAAAGGAGGAGAGAGATATTATATAGGAGAGGACACAC"
  // };
  // constructor() {
  //   super()
  //   this.brushed = this.brushed.bind(this)
  // }

  componentDidMount() {
    this.transcribe();
  }

  componentDidUpdate(prevProps, prevState) {
    this.transcribe();
  }

  formatData = str => {
    let data = [];
    let arr = str.trim().split("");
    for (let i = 0; i < arr.length; i++) {
      let obj = {};
      obj.index = i + 1;
      obj.base = arr[i];
      data.push(obj);
    }
    return data;
  };

  transcribe = () => {
    var node = d3.select(this.node),
      margin = { top: 20, right: 20, bottom: 110, left: 40 },
      margin2 = { top: 430, right: 20, bottom: 30, left: 40 },
      width = +node.attr("width") - margin.left - margin.right,
      height = +node.attr("height") - margin.top - margin.bottom,
      height2 = +node.attr("height") - margin2.top - margin2.bottom;

    // var parseDate = d3.timeParse("%b %Y");

    var x = d3.scaleLinear().range([0, width]),
      x2 = d3.scaleLinear().range([0, width]),
      y = d3
        .scaleBand()
        .range([height, 0])
        .padding(0),
      y2 = d3
        .scaleBand()
        .range([height2, 0])
        .padding(1);

    var xAxis = d3.axisBottom(x),
      xAxis2 = d3.axisBottom(x2),
      yAxis = d3.axisLeft(y);

    var brush = d3
      .brushX()
      .extent([[0, 0], [width, height2]])
      .on("brush end", brushed);

    var zoom = d3
      .zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on("zoom", zoomed);

    var area = d3
      .area()
      // .curve(d3.curveMonotoneX)
      .x(function(d, i) {
        return x(i + 1);
      })
      .y0(height)
      .y1(function(d) {
        return y(d);
      });

    var area2 = d3
      .area()
      // .curve(d3.curveMonotoneX)
      .x(function(d, i) {
        return x2(i + 1);
      })
      .y0(height2)
      .y1(function(d) {
        return y2(d);
      });

    node
      .append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    // var clip = node
    //   .append("defs")
    //   .append("svg:clipPath")
    //   .attr("id", "clip")
    //   .append("svg:rect")
    //   .attr("width", width)
    //   .attr("height", height)
    //   .attr("x", 0 + margin.left)
    //   .attr("y", 0 + margin.top);

    var focus = node
      .append("g")
      .attr("class", "focus")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    // .attr("clip-path", "url(#clip)");

    var context = node
      .append("g")
      .attr("class", "context")
      .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    const data = this.formatData(d3.select("#dna").text());

    x.domain(
      d3.extent(data, function(d) {
        return d.index;
      })
    );
    y.domain(["A", "T", "G", "C"].reverse());
    x2.domain(x.domain());
    y2.domain(y.domain());

    let rectX = x(2)-1,
      rectY = y.bandwidth() - 10;

    focus
      .append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", area);

    // function scatter(d) {
    //   focus
    //     .selectAll(".bar")
    //     .data(data)
    //     .enter()
    //     .append("circle")
    //     .attr("class", "bar")
    //     .attr("x", function(d) {
    //       return x(d.index);
    //     })
    //     .attr("cy", function(d) {
    //       return y(d.base);
    //     })
    //     .attr("r", 3);
    // }
    focus
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", function(d) {
        return x(d.index) - rectX / 2;
      })
      .attr("y", function(d) {
        return y(d.base);
      })
      .attr("width", rectX)
      .attr("height", rectY);

    focus
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    focus
      .append("g")
      .attr("class", "axis axis--y")
      .call(yAxis);

    context
      .append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", area2);

    context
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", function(d) {
        return x2(d.index);
      })
      .attr("y", function(d) {
        return y2(d.base);
      })
      .attr("width", 8)
      .attr("height", 6);

    context
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);

    context
      .append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brush.move, x.range());

    node
      .append("rect")
      .attr("class", "zoom")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(zoom);

    function brushed() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
      var s = d3.event.selection || x2.range();
      x.domain(s.map(x2.invert));
      let changeInPixels = x(2) - x(1) - 1;
      console.log(changeInPixels, x(1), x(2), x.domain(), x.range());
      focus
        .selectAll(".bar")
        .attr("x", function(d) {
          return x(d.index) - changeInPixels / 2;
        })
        .attr("y", function(d) {
          return y(d.base);
        })
        .attr("width", changeInPixels)
        .attr("height", rectY);
      focus.select(".axis--x").call(xAxis);
      node
        .select(".zoom")
        .call(
          zoom.transform,
          d3.zoomIdentity.scale(width / (s[1] - s[0])).translate(-s[0], 0)
        );
    }

    function zoomed() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
      var t = d3.event.transform;
      x.domain(t.rescaleX(x2).domain());
      focus.select(".bar").attr("d", area2);
      focus.select(".axis--x").call(xAxis);
      context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
    }

    // function type(d) {
    //   d.date = parseDate(d.date);
    //   d.price = +d.price;
    //   return d;
    // }
  };

  render() {
    return (
      <div>
        <svg
          ref={node => (this.node = node)}
          style={{ background: "#fafafa", border: "2px solid #444" }}
          width={960}
          height={500}
        ></svg>
      </div>
    );
  }
}
