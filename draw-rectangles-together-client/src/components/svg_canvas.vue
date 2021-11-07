<template>
  <v-app>
    <v-row align="center" justify="center">
      <v-col cols="1">
        <v-container fill-height fluid id="button-container">
          <v-row align="center" justify="center">
            <v-col>
              <v-tooltip right>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    block
                    depressed
                    large
                    color="primary"
                    elevation="8"
                    @click="mode = 'e'"
                    v-bind="attrs"
                    v-on="on"
                    >ADD</v-btn
                  >
                </template>
                <span>You can also press E to add new points</span>
              </v-tooltip>
            </v-col>
          </v-row>
          <v-row align="center" justify="center">
            <v-col>
              <v-tooltip right>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    block
                    depressed
                    large
                    color="teal"
                    dark
                    elevation="8"
                    @click="mode = 'o'"
                    v-bind="attrs"
                    v-on="on"
                    >MOVE</v-btn
                  >
                </template>
                <span>You can also press O to move points around</span>
              </v-tooltip>
            </v-col>
          </v-row>
          <v-row align="center" justify="center">
            <v-col>
              <v-tooltip right>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    block
                    depressed
                    large
                    color="error"
                    elevation="8"
                    @click="mode = 'p'"
                    v-bind="attrs"
                    v-on="on"
                    >DELETE</v-btn
                  >
                </template>
                <span>You can also press P to delete points</span>
              </v-tooltip>
            </v-col>
          </v-row>
          <v-row align="center" justify="center">
            <v-col class="justify-center" cols="12">
              <v-color-picker
                hide-mode-switch
                mode="hexa"
                v-model="lastColor"
              ></v-color-picker>
            </v-col>
            <v-col cols="12">
              <v-tooltip right>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    block
                    depressed
                    large
                    color="cyan"
                    elevation="8"
                    @click="mode = 'c'"
                    v-bind="attrs"
                    v-on="on"
                    dark
                    >COLOR</v-btn
                  >
                </template>
                <span>You can also press C to color the rectangles</span>
              </v-tooltip>
            </v-col>
          </v-row>
          <v-row align="center" justify="center">
            <v-col cols="12">
              <v-text-field
                v-model="width"
                label="Width"
                outlined
                dark
                type="number"
                dense
                hide-details
              ></v-text-field>
              <br />
              <v-text-field
                v-model="height"
                label="Height"
                outlined
                dark
                type="number"
                dense
                hide-details
              ></v-text-field>
            </v-col>
            <v-col col="12">
              <v-tooltip right>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    block
                    depressed
                    large
                    color="indigo"
                    elevation="8"
                    @click="resizeRectangle()"
                    v-bind="attrs"
                    v-on="on"
                    dark
                    >RESIZE</v-btn
                  >
                </template>
                <span>You can also press R to resize</span>
              </v-tooltip>
            </v-col>
          </v-row>
          <v-row align="center" justify="center">
            <v-col>
              <v-tooltip right>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    block
                    depressed
                    large
                    color="success"
                    elevation="8"
                    @click="downloadSVG()"
                    v-bind="attrs"
                    v-on="on"
                    >SVG</v-btn
                  >
                </template>
                <span>You can also press D to download current SVG</span>
              </v-tooltip>
            </v-col>
          </v-row>
          <v-row align="center" justify="center">
            <v-col>
              <v-tooltip right>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    block
                    depressed
                    large
                    color="success"
                    elevation="8"
                    @click="downloadPNG()"
                    v-bind="attrs"
                    v-on="on"
                    >PNG</v-btn
                  >
                </template>
                <span>You can also press F to download current PNG</span>
              </v-tooltip>
            </v-col>
          </v-row>
          <v-row align="center" justify="center">
            <v-col>
              <v-tooltip right>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    block
                    depressed
                    large
                    color="success"
                    elevation="8"
                    @click="downloadPath()"
                    v-bind="attrs"
                    v-on="on"
                    >PATH</v-btn
                  >
                </template>
                <span>You can also press G to download the path file</span>
              </v-tooltip>
            </v-col>
          </v-row>
          <v-row align="center" justify="center">
            <v-col>
              <v-file-input
                label="Path input"
                outlined
                dense
                dark
                accept=".json"
                @change="loadPath($event)"
              ></v-file-input>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
      <v-col cols="11">
        <div style="display: block; margin: auto; height: 99vh">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            id="svg"
          ></svg>
        </div>
      </v-col>
    </v-row>
  </v-app>
</template>

<script>
import rectangle from "@/plugins/rectangle";
export default {
  name: "RectangleSVG",
  data() {
    return {
      mouseStartPosition: { x: 0, y: 0 }, // for resize etc
      mousePosition: { x: 0, y: 0 },
      viewboxStartPosition: { x: 0, y: 0 },
      viewboxPosition: { x: 0, y: 0 },
      viewboxSize: { x: 0, y: 0 },
      viewboxScale: 1.0,
      mouseDown: false,
      mouseDownMove: false,
      svg: null, // the root svg
      rootRectangle: null, // the root of all rectangles
      lastRectangle: null, // what is the last rectangle we were in
      mode: "e", // e for edit point, o for move point, p for delete point, c for coloring
      hoverCircleID: -1, // which circle are we hovering over now
      coord: {
        // for absolute position on svg
        x: 0,
        y: 0,
      },
      lastHoverRectangleID: -1, // record the last hovering triangle id, for recoloring
      lastColor: "#00abff", // record the last color we picked
      width: -1, // record the width of svg
      height: -1, // record the height of svg
    };
  },
  created() {
    window.addEventListener("keypress", this.doCommand);
    window.addEventListener("resize", this.windowResize);
  },
  destroyed() {
    window.removeEventListener("keypress", this.doCommand);
    window.removeEventListener("resize", this.windowResize);
  },
  watch: {
    mode(newMode, oldMode) {
      // console.log(newMode, oldMode);
      if (newMode == "i") {
        // do absolutely nothing
        // since we will remove everything
        return;
      }
      this.clearMode(oldMode);

      if (newMode == "o") {
        // if we enter the move mode
        this.rootRectangle.showMovablePoints();
      } else if (newMode == "p") {
        // if we enter the delete mode
        this.rootRectangle.showDeletablePoints();
      } else if (newMode == "e") {
        // if we reenter the edit mode, we want the preview to show up immediately
        if (!this.outsideRootRectangle()) {
          // if we are inside the rectangle, show the previews
          this.lastRectangle = this.rootRectangle.addPoint(
            this.coord.x,
            this.coord.y
          );
        }
      } else if (newMode == "c") {
        // immediately start coloring
        this.lastHoverRectangleID = this.rootRectangle.changeColorByPosition(
          this.coord.x,
          this.coord.y,
          this.lastColor
        );
      }
    },
  },
  methods: {
    outsideRootRectangle() {
      if (
        // this.coord will be updated on mouse movements
        this.coord.x >= this.rootRectangle.width ||
        this.coord.x <= 0 ||
        this.coord.y <= 0 ||
        this.coord.y >= this.rootRectangle.height
      ) {
        return true;
      } else {
        return false;
      }
    },
    doCommand(e) {
      let cmd = String.fromCharCode(e.keyCode).toLowerCase();
      if (cmd == "o") {
        if (this.mode == "o") {
          // we want to exit the move points mode
          this.mode = "e";
        } else {
          this.mode = "o";
        }
      } else if (cmd == "p") {
        if (this.mode == "p") {
          // go back to editing mode
          this.mode = "e";
        } else {
          this.mode = "p";
        }
      } else if (cmd == "e" && this.mode != "e") {
        this.mode = "e";
      } else if (cmd == "c") {
        if (this.mode == "c") {
          this.mode = "e";
        } else {
          this.mode = "c";
        }
      } else if (cmd == "r") {
        this.resizeRectangle();
      } else if (cmd == "d") {
        this.downloadSVG();
      } else if (cmd == "f") {
        this.downloadPNG();
      } else if (cmd == "g") {
        this.downloadPath();
      }
    },
    getDim() {
      // get the dimension of the svg
      this.width = this.svg.clientWidth;
      this.height = this.svg.clientHeight;
    },
    windowResize() {
      // fire whenever window resize, we want to change the viewbox etc
      this.getDim();
      this.viewboxSize = { x: this.width, y: this.height };
      this.setviewbox();
    },
    setviewbox() {
      // just don't touch this code i don't wanna know the magic
      var vp = { x: 0, y: 0 };
      var vs = { x: 0, y: 0 };
      vp.x = this.viewboxPosition.x;
      vp.y = this.viewboxPosition.y;
      vs.x = this.viewboxSize.x * this.viewboxScale;
      vs.y = this.viewboxSize.y * this.viewboxScale;
      this.svg.setAttribute(
        "viewBox",
        vp.x + " " + vp.y + " " + vs.x + " " + vs.y
      );
    },

    clearMode(mode) {
      if (mode == "p") {
        // we were in deleting mode
        this.rootRectangle.removeDeletablePoints();
      } else if (mode == "o") {
        // we were in moving mode
        this.rootRectangle.removeMovablePoints();
      } else if (mode == "c") {
        if (this.lastHoverRectangleID != -1) {
          this.rootRectangle.changeColor(this.lastHoverRectangleID);
          this.lastHoverRectangleID = -1;
        }
      } else if (mode == "e") {
        if (this.lastRectangle != null) {
          this.lastRectangle.removeChildren();
          this.lastRectangle = null;
        }
      }
    },

    mousedown(e) {
      this.mouseStartPosition.x = e.pageX;
      this.mouseStartPosition.y = e.pageY;
      this.viewboxStartPosition.x = this.viewboxPosition.x;
      this.viewboxStartPosition.y = this.viewboxPosition.y;
      this.mouseDown = true;
      this.svg.addEventListener("mouseup", this.mouseup);
      if (this.mode == "p" && this.hoverCircleID != -1) {
        // if we are in deletion mode, immediately delete the point on mouse down
        this.rootRectangle.deleteInnerPoint(this.hoverCircleID);
        this.hoverCircleID = -1;
      }
    },
    mouseup() {
      if (this.mouseDown) {
        this.mouseDown = false;
        this.svg.removeEventListener("mouseup", this.mouseup);
        if (this.mode == "e") {
          // we are in edit mode
          if (!this.mouseDownMove && this.lastRectangle != null) {
            // if we pushed down the mouse and are in edit mode
            // and the preview is telling us that we can add a rectangle
            // then we actually add the rectangle
            this.lastRectangle = this.rootRectangle.addPoint(
              this.coord.x,
              this.coord.y,
              true
            ); // actually adding the point
            if (this.lastRectangle != null) {
              // if nothing went wrong
              // such as adding to point or adding to line or etc
              // then for each rectangle, we increment the inner rectangle count
              this.rootRectangle.incrementInnerPointCount(
                this.lastRectangle.id
              );
            }
            // now we don't need to delete any preview so set the last rectangle to null
            this.lastRectangle = null;
          } else if (this.mouseDownMove) {
            this.mouseDownMove = false;
          } else if (
            this.lastRectangle == null &&
            !this.outsideRootRectangle()
          ) {
            // if the preview returns null and we are inside the root rectangle
            // send an alert
            window.alert(
              "Cannot click here, either you clicked on a point or a line or maximum layers achieved."
            );
          }
        } else if (this.mode == "c") {
          // if the mouse has not moved much and we clicked on it
          if (!this.mouseDownMove && this.lastHoverRectangleID != -1) {
            // console.log(this.lastHoverRectangleID);
            this.rootRectangle.changeColor(
              this.lastHoverRectangleID,
              this.lastColor,
              true
            ); // actually change the color
          } else if (this.mouseDownMove) {
            this.mouseDownMove = false;
          } else if (
            this.lastHoverRectangleID == -1 &&
            !this.outsideRootRectangle
          ) {
            window.alert("You are probably trying to click on an edge.");
          }
        }
      }
    },
    mousemove(e) {
      // when we move cursor
      // we want either move the points
      // or move the canvas
      // we calculate the position on canvas
      var CTM = this.svg.getScreenCTM();
      this.coord = {
        x: (e.clientX - CTM.e) / CTM.a,
        y: (e.clientY - CTM.f) / CTM.d,
      };
      this.mousePosition.x = e.offsetX;
      this.mousePosition.y = e.offsetY;

      if (!this.mouseDown && (this.mode == "p" || this.mode == "o")) {
        // we need to find which point we are hovering over
        if (e.target.classList.contains("draggable")) {
          this.hoverCircleID = e.target.id;
        } else {
          this.hoverCircleID = -1;
        }
      }
      // if we push down the mouse
      if (this.mouseDown) {
        // if we moved enough
        if (Math.abs(e.movementX) >= 5 || Math.abs(e.movementY) >= 5) {
          this.mouseDownMove = true;
        }
        // when there was no hover, don't do anything
        if (this.hoverCircleID == -1) {
          this.viewboxPosition.x =
            this.viewboxStartPosition.x +
            (this.mouseStartPosition.x - e.pageX) * this.viewboxScale;
          this.viewboxPosition.y =
            this.viewboxStartPosition.y +
            (this.mouseStartPosition.y - e.pageY) * this.viewboxScale;
          this.setviewbox();
        } else {
          // else we need to move points
          if (this.mode == "o") {
            // point 0 special case
            this.rootRectangle.moveInnerPoint(
              this.hoverCircleID,
              this.coord.x,
              this.coord.y
            );
          }
        }
      }

      if (this.mode == "e" && !this.outsideRootRectangle()) {
        // we are inside canvas
        // first we find the cell to put in the new point
        const lastRectangleCopy = this.lastRectangle;
        this.lastRectangle = this.rootRectangle.addPoint(
          this.coord.x,
          this.coord.y
        ); // preview the new rectangles
        if (lastRectangleCopy != null && this.lastRectangle != null) {
          // first scenario: we moved to different cell
          if (lastRectangleCopy.id != this.lastRectangle.id) {
            lastRectangleCopy.removeChildren();
          }
        } else if (this.lastRectangle == null && lastRectangleCopy != null) {
          // second scenario: we moved out
          lastRectangleCopy.removeChildren();
        }
      } else if (this.mode == "c" && !this.outsideRootRectangle()) {
        if (e.target.getAttribute("true_id") != this.lastHoverRectangleID) {
          // console.log(e.target.getAttribute("true_id"));
          if (this.lastHoverRectangleID != -1) {
            this.rootRectangle.changeColor(this.lastHoverRectangleID);
          }
          this.lastHoverRectangleID = this.rootRectangle.changeColor(
            e.target.getAttribute("true_id"),
            this.lastColor
          );
        }
      } else if (
        (this.outsideRootRectangle() && this.mode == "e") ||
        this.mode == "c"
      ) {
        this.clearMode(this.mode);
      }
    },
    wheel(e) {
      // don't touch the code
      var scale = e.deltaY < 0 ? 0.98 : 1.02;
      if (
        this.viewboxScale * scale < 20 &&
        this.viewboxScale * scale > 1 / 20
      ) {
        var mpos = {
          x: this.mousePosition.x * this.viewboxScale,
          y: this.mousePosition.y * this.viewboxScale,
        };
        var vpos = { x: this.viewboxPosition.x, y: this.viewboxPosition.y };
        var cpos = { x: mpos.x + vpos.x, y: mpos.y + vpos.y };
        this.viewboxPosition.x =
          (this.viewboxPosition.x - cpos.x) * scale + cpos.x;
        this.viewboxPosition.y =
          (this.viewboxPosition.y - cpos.y) * scale + cpos.y;
        this.viewboxScale *= scale;
        this.setviewbox();
      }
    },
    mouseleave() {
      // when mouse moves out of the svg region
      // we want to remove the previews
      if (this.mode == "c" || this.mode == "e") {
        this.clearMode(this.mode);
      }
      this.coord = { x: 0, y: 0 };
    },
    resizeRectangle() {
      // resize the rectangle
      if (this.width <= 0 || this.height <= 0) {
        window.alert("SVG width and height must be positive");
      } else {
        this.clearMode(this.mode);
        this.rootRectangle.resize(this.width, this.height, 0, 0);
        this.mode = "i"; // go into idle mode
      }
    },
    copySVG() {
      var svg_cpy = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      svg_cpy.setAttribute("width", this.width);
      svg_cpy.setAttribute("height", this.height);
      svg_cpy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svg_cpy.setAttribute("id", "svg_copy");
      document.body.appendChild(svg_cpy);
      var all_rectangles = this.svg.getElementsByTagName("rect");
      for (let i = 0; i < all_rectangles.length; i++) {
        var rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        rect.setAttributeNS(null, "x", all_rectangles[i].getAttribute("x"));
        rect.setAttributeNS(null, "y", all_rectangles[i].getAttribute("y"));
        rect.setAttributeNS(
          null,
          "width",
          all_rectangles[i].getAttribute("width")
        );
        rect.setAttributeNS(
          null,
          "height",
          all_rectangles[i].getAttribute("height")
        );
        rect.setAttributeNS(
          null,
          "style",
          all_rectangles[i].getAttribute("style")
        );
        svg_cpy.appendChild(rect);
      }
      return svg_cpy;
    },

    downloadSVG() {
      // download the svg file for viewing
      this.clearMode(this.mode);
      var svg_cpy = this.copySVG();
      // we finished copying everything
      // now download it
      var svgData = svg_cpy.outerHTML;
      var svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      var svgUrl = URL.createObjectURL(svgBlob);
      var downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = "draw-rectangles.svg";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      document.body.removeChild(svg_cpy);
      if (this.mode == "o") {
        this.rootRectangle.showMovablePoints();
      } else if (this.mode == "p") {
        this.rootRectangle.showDeletablePoints();
      }
    },
    downloadPNG() {
      // download the svg file for viewing
      this.clearMode(this.mode);
      var svg_cpy = this.copySVG();
      // we finished copying everything
      // now download it
      var svgData = svg_cpy.outerHTML;
      var svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      var svgUrl = URL.createObjectURL(svgBlob);
      let image = new Image();
      let me = this;
      image.onload = () => {
        let canvas = document.createElement("canvas");
        canvas.width = me.width;
        canvas.height = me.height;
        let context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, me.width, me.height);
        let png = canvas.toDataURL(); // default png
        var downloadLink = document.createElement("a");
        downloadLink.href = png;
        downloadLink.download = "draw-rectangles.png";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        document.body.removeChild(svg_cpy);
        if (me.mode == "o") {
          me.rootRectangle.showMovablePoints();
        } else if (me.mode == "p") {
          me.rootRectangle.showDeletablePoints();
        }
      };
      image.src = svgUrl;
    },
    downloadPath() {
      // download all the info we need to reconstruct the rectangles
      var jsonData = this.rootRectangle.exportPath();
      let dataStr = JSON.stringify(jsonData);
      let dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      let exportFileDefaultName = "draw-rectangles-path.json";

      let linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    },
    loadPath(event) {
      // load the info and reconstruct the rectangles
      if (!event) {
        return;
      }
      this.mode = "i"; // idle mode, do nothing
      var reader = new FileReader();
      reader.onload = this.createRectangleFromPath;
      reader.readAsText(event);
    },

    createRectangleFromPath(event) {
      // create a new rectangle from what we have
      var path = JSON.parse(event.target.result);
      if (path.type != "draw-rectangles-path") {
        this.clearMode(this.mode);
        this.mode = "i";
        return;
      }
      while (this.svg.lastChild) {
        this.svg.removeChild(this.svg.lastChild);
      }
      this.width = path.width;
      this.height = path.height;
      this.rootRectangle = new rectangle(
        this.svg,
        this.width,
        this.height,
        0,
        0,
        0
      );
      for (var i = 0; i < path.points.length; i++) {
        var point = path.points[i];
        this.lastRectangle = this.rootRectangle.addPoint(
          point.x,
          point.y,
          true
        );
        if (this.lastRectangle != null) {
          // if nothing went wrong
          // such as adding to point or adding to line or etc
          // then for each rectangle, we increment the inner rectangle count
          this.rootRectangle.incrementInnerPointCount(this.lastRectangle.id);
        }
      }
      for (const [id, color] of Object.entries(path.colors)) {
        this.rootRectangle.changeColor(id, color, true);
      }
      this.lastRectangle = null;
      this.mode = "i";
    },
  },
  mounted() {
    this.svg = document.getElementById("svg");
    this.width = this.svg.clientWidth;
    this.height = this.svg.clientHeight;
    this.rootRectangle = new rectangle(
      this.svg,
      this.width,
      this.height,
      0,
      0,
      0
    );
    this.viewboxSize.x = this.width;
    this.viewboxSize.y = this.height;
    this.svg.addEventListener("mousedown", this.mousedown);
    this.svg.addEventListener("mousemove", this.mousemove);
    this.svg.addEventListener("wheel", this.wheel);
    this.svg.addEventListener("mouseleave", this.mouseleave);
  },
};
</script>

<style scoped>
#button-container {
  padding: 1em 1em 1em 1em;
  margin: 0em 0em 0em 0em;
  border: 1px solid #2986ce;
  border-radius: 8% 8% 8% 8% / 2% 2% 2% 2%;
  background: #2986ce;
  background: -webkit-linear-gradient(0deg, #2986ce 0%, #7581cd 100%);
  background: linear-gradient(0deg, #2986ce 0%, #7581cd 100%);
}
</style>