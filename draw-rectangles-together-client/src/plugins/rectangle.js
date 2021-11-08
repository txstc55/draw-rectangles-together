class rectangle {
    static calculatePath(id) {
        var path = []
        while (id > 4) {
            id -= 1;
            var remainder = id % 4;
            path.push(remainder)
            id = id - remainder;
            id = id / 4;
        }
        path.push(id - 1);
        return path;
    }

    constructor(svg, width, height, x_start, y_start, id, stroke_width = 10, color = "") {
        this.svg = svg; // the svg canvas
        this.width = width; // the width of the rectangle
        this.height = height; // the height of the rectangle
        this.id = id; //the id of this rectangle element
        this.inner_point_x_percent = 0; // when we have placed a point, what percent of offset on x axis
        this.inner_point_y_percent = 0; // when we have placed a point, what percent of offset on y axis
        this.x_start = x_start; // the offset of x axis of this rectangle
        this.y_start = y_start; // the offset of y axis of this rectangle
        this.inner_point_count = 0; // how many other inner rectangles we need
        this.color = color; // the default color
        this.stroke_width = stroke_width; // slowly decreasing stroke width
        this.rectangle_children = [null, null, null, null]; // list of children
        this.rect = null;
        this.inner_point_move = null;
        this.inner_point_delete = null;
        this.drawSelf();
    }

    // create the rectangle on svg
    // if it is a valid rectangle
    // then create empty 4 children
    // since children doesn't have width or height, they will not create grandchildren
    drawSelf() {
        if (this.width > 0 && this.height > 0) {
            this.rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            this.rect.setAttributeNS(null, "x", this.x_start);
            this.rect.setAttributeNS(null, "y", this.y_start);
            this.rect.setAttributeNS(null, "width", this.width);
            this.rect.setAttributeNS(null, "height", this.height);
            this.rect.setAttributeNS(null, "id", "rec_" + this.id);
            this.rect.setAttributeNS(null, "true_id", this.id);
            this.rect.setAttributeNS(
                null,
                "style",
                "fill: " + (this.color == "" ? "#ffffff" : this.color) + ";stroke-width: " + Math.ceil(this.stroke_width) + "; stroke: rgb(0, 0, 0);"
            );
            this.svg.appendChild(this.rect);
            for (var i = 0; i < 4; i++) {
                var rec = new rectangle(this.svg, 0, 0, this.x_start, this.y_start, this.id * 4 + i + 1, Math.max(this.stroke_width - 0.5, 1), this.color);
                this.rectangle_children[i] = rec;
            }
        }
    }

    hideStroke(hide) {
        if (this.rect != null) {
            // console.log(this.id, this.color);
            this.rect.setAttributeNS(
                null,
                "style",
                ("fill: " + (this.color == "" ? "#ffffff" : this.color) + ";") + (hide ? ((this.color == "" || this.width < 2 || this.height < 2 || this.inner_point_count > 0) ? "" : ("stroke-width: 2; stroke: " + (this.color) + ";")) : ("stroke-width: " + Math.ceil(this.stroke_width) + "; stroke: rgb(0, 0, 0);"))
            );
            // console.log(("fill: " + (this.color == "" ? "#ffffff" : this.color) + ";") + (hide ? ("stroke-width: 2; stroke: " + (this.color == "" ? "#ffffff" : this.color) + ";") : ("stroke-width: " + Math.ceil(this.stroke_width) + "; stroke: rgb(0, 0, 0);")))
        }
        if (this.inner_point_count > 0) {
            for (var i = 0; i < this.rectangle_children.length; i++) {
                if (this.rectangle_children[i] != null) {
                    this.rectangle_children[i].hideStroke(hide);
                }
            }
        }
    }

    // resize itself by changing attributes of the svg element
    // if the element was never created, then create it
    // if it has children, resize the children also
    resize(width, height, x_start, y_start) {
        // console.log("Resize id: " + this.id);
        if (width > 0 && height > 0) {
            this.width = width;
            this.height = height;
            this.x_start = x_start;
            this.y_start = y_start;
            if (this.rect == null) {
                this.rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                this.rect.setAttributeNS(null, "id", "rec_" + this.id);
                this.rect.setAttributeNS(
                    null,
                    "style",
                    "fill: " + (this.color == "" ? "#ffffff" : this.color) + ";stroke-width: " + Math.ceil(this.stroke_width) + "; stroke: rgb(0, 0, 0);"
                );
                this.svg.appendChild(this.rect);
            }
            this.rect.setAttributeNS(null, "x", this.x_start);
            this.rect.setAttributeNS(null, "y", this.y_start);
            this.rect.setAttributeNS(null, "width", this.width);
            this.rect.setAttributeNS(null, "height", this.height);
            if (this.inner_point_count > 0) {
                this.rectangle_children[0].resize(width * this.inner_point_x_percent, height * this.inner_point_y_percent, this.x_start, this.y_start);
                this.rectangle_children[1].resize(width - width * this.inner_point_x_percent, height * this.inner_point_y_percent, this.x_start + width * this.inner_point_x_percent, this.y_start);
                this.rectangle_children[2].resize(width * this.inner_point_x_percent, height - height * this.inner_point_y_percent, this.x_start, this.y_start + height * this.inner_point_y_percent);
                this.rectangle_children[3].resize(width - width * this.inner_point_x_percent, height - height * this.inner_point_y_percent, this.x_start + width * this.inner_point_x_percent, this.y_start + height * this.inner_point_y_percent);
            }
        }
    }

    // remove the rectangle itself and all of its children
    removeSelf(color) {
        this.inner_point_move = null;
        this.inner_point_delete = null;
        if (this.rect != null) {
            document.getElementById("rec_" + this.id).remove();
            this.width = 0;
            this.height = 0;
            this.rect = null;
            this.removeChildren();
        }
        this.color = color;
    }

    // remove children rectangles
    removeChildren() {
        this.inner_point_move = null;
        this.inner_point_delete = null;
        for (var i = 0; i < this.rectangle_children.length; i++) {
            if (this.rectangle_children[i] != null) {
                this.rectangle_children[i].removeSelf(this.color);
            }
        }
        this.inner_point_count = 0;
    }

    // move the inner point to a new position
    // which means all of its children needs resize
    movePoint(x, y) {
        if (x > this.x_start && x < this.x_start + this.width && y > this.y_start && y < this.y_start + this.height) {
            this.inner_point_x_percent = (x - this.x_start) / this.width; // record the portion
            this.inner_point_y_percent = (y - this.y_start) / this.height; // record the portion
            this.rectangle_children[0].resize(x - this.x_start, y - this.y_start, this.x_start, this.y_start)
            this.rectangle_children[1].resize(this.x_start + this.width - x, y - this.y_start, x, this.y_start)
            this.rectangle_children[2].resize(x - this.x_start, this.y_start + this.height - y, this.x_start, y)
            this.rectangle_children[3].resize(this.x_start + this.width - x, this.y_start + this.height - y, x, y)
        }
    }

    // adding an inner point, can be for preview or actually adding the rectangles
    // we will return the last triangle for the purpose of removing the previews
    // if we return null
    // that means we do not want to deleate its children for now
    addPoint(x, y, add_point = false) {
        // console.log(x, y, add_point, this.id, this.inner_point_count);
        if (this.id >= 4503599627370496) {
            // too many layers
            return null;
        }
        if (x > this.x_start && x < this.x_start + this.width && y > this.y_start && y < this.y_start + this.height) {
            if (this.inner_point_count == 0) {
                // console.log("Inside id: " + this.id);
                // we hit the bottom leaf
                this.movePoint(x, y);
                if (add_point) {
                    this.removeChildren();
                    this.rectangle_children[0] = new rectangle(this.svg, x - this.x_start, y - this.y_start, this.x_start, this.y_start, this.id * 4 + 0 + 1, Math.max(this.stroke_width - 0.5, 1), this.color);
                    this.rectangle_children[1] = new rectangle(this.svg, this.x_start + this.width - x, y - this.y_start, x, this.y_start, this.id * 4 + 1 + 1, Math.max(this.stroke_width - 0.5, 1), this.color);
                    this.rectangle_children[2] = new rectangle(this.svg, x - this.x_start, this.y_start + this.height - y, this.x_start, y, this.id * 4 + 2 + 1, Math.max(this.stroke_width - 0.5, 1), this.color);
                    this.rectangle_children[3] = new rectangle(this.svg, this.x_start + this.width - x, this.y_start + this.height - y, x, y, this.id * 4 + 3 + 1, Math.max(this.stroke_width - 0.5, 1), this.color);
                    return this; // only here we have successfully added a point
                }
                return this;
            } else {
                if (x < this.x_start + this.width * this.inner_point_x_percent) {
                    if (y < this.y_start + this.height * this.inner_point_y_percent) {
                        return this.rectangle_children[0].addPoint(x, y, add_point);
                    } else if (y > this.y_start + this.height * this.inner_point_y_percent) {
                        return this.rectangle_children[2].addPoint(x, y, add_point);
                    } else {
                        return null;
                    }
                } else if (x > this.x_start + this.width * this.inner_point_x_percent) {
                    if (y < this.y_start + this.height * this.inner_point_y_percent) {
                        return this.rectangle_children[1].addPoint(x, y, add_point);
                    } else if (y > this.y_start + this.height * this.inner_point_y_percent) {
                        return this.rectangle_children[3].addPoint(x, y, add_point);
                    } else {
                        return null;
                    }
                } else {
                    // it is on the line
                    return null;
                }
            }

        } else {
            return null;
        }
    }

    // increase the inner point count on successful addition
    incrementInnerPointCount(id) {
        var rectangle_selected = this;
        rectangle_selected.inner_point_count += 1;
        if (id != 0) {
            const path = rectangle.calculatePath(id);
            var length = path.length - 1;
            while (length >= 0) {
                rectangle_selected = rectangle_selected.rectangle_children[path[length]];
                length -= 1;
                rectangle_selected.inner_point_count += 1;
            }
        }
    }

    // show all the movable points on svg as circles or black
    showMovablePoints() {
        if (this.inner_point_count > 0) {
            const x = this.x_start + this.inner_point_x_percent * this.width;
            const y = this.y_start + this.inner_point_y_percent * this.height;
            if (this.inner_point_move == null) {
                this.inner_point_move = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                this.inner_point_move.setAttributeNS(null, "r", Math.max(1, Math.ceil(Math.min(Math.min(this.width, this.height), this.stroke_width) * 1.5)));
                this.inner_point_move.setAttributeNS(null, "class", "draggable");
                this.inner_point_move.setAttributeNS(null, "id", this.id);
                this.inner_point_move.setAttributeNS(
                    null,
                    "style",
                    "fill: #00ffac"
                );
                const blink_animation = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
                blink_animation.setAttribute("attributeName", "opacity");
                blink_animation.setAttribute("values", "0;1;0");
                blink_animation.setAttribute("dur", "2s");
                blink_animation.setAttribute("repeatCount", "indefinite");
                blink_animation.setAttribute("begin", "0.1");
                this.inner_point_move.appendChild(blink_animation);
            }
            this.inner_point_move.setAttributeNS(null, "cx", x);
            this.inner_point_move.setAttributeNS(null, "cy", y);
            this.svg.appendChild(this.inner_point_move);
            for (var i = 0; i < this.rectangle_children.length; i++) {
                this.rectangle_children[i].showMovablePoints();
            }
        }
    }

    // dynamically update the point positions
    // when one of the point is moved
    // since we have a percentage based system
    // we need to move all of its children
    moveMovablePoints() {
        if (this.inner_point_count > 0) {
            const x = this.x_start + this.inner_point_x_percent * this.width;
            const y = this.y_start + this.inner_point_y_percent * this.height;
            this.inner_point_move.setAttributeNS(null, "cx", x);
            this.inner_point_move.setAttributeNS(null, "cy", y);
            for (var i = 0; i < this.rectangle_children.length; i++) {
                this.rectangle_children[i].moveMovablePoints();
            }
        }
    }

    // remove the previous shown movable points on canvas
    removeMovablePoints() {
        if (this.inner_point_count > 0) {
            document.getElementById(this.id).remove();
            for (var i = 0; i < this.rectangle_children.length; i++) {
                if (this.rectangle_children[i] != null) {
                    this.rectangle_children[i].removeMovablePoints();
                }
            }
        }
    }

    // show all the deletable points on svg as circle of red
    showDeletablePoints() {
        if (this.inner_point_count == 1) {
            const x = this.x_start + this.inner_point_x_percent * this.width;
            const y = this.y_start + this.inner_point_y_percent * this.height;
            if (this.inner_point_delete == null) {
                this.inner_point_delete = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                this.inner_point_delete.setAttributeNS(null, "class", "draggable");
                this.inner_point_delete.setAttributeNS(null, "id", this.id);
                this.inner_point_delete.setAttributeNS(null, "r", Math.max(1, Math.ceil(Math.min(Math.min(this.width, this.height), this.stroke_width) * 1.5)));
                this.inner_point_delete.setAttributeNS(
                    null,
                    "style",
                    "fill: #ff0000"
                );
                const blink_animation = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
                blink_animation.setAttribute("attributeName", "opacity");
                blink_animation.setAttribute("values", "0;1;0");
                blink_animation.setAttribute("dur", "2s");
                blink_animation.setAttribute("repeatCount", "indefinite");
                blink_animation.setAttribute("begin", "0.1");
                this.inner_point_delete.appendChild(blink_animation);
            }
            this.inner_point_delete.setAttributeNS(null, "cx", x);
            this.inner_point_delete.setAttributeNS(null, "cy", y);
            this.svg.appendChild(this.inner_point_delete);
        } else if (this.inner_point_count > 1) {
            for (var i = 0; i < this.rectangle_children.length; i++) {
                this.rectangle_children[i].showDeletablePoints();
            }
        }
    }

    // remove the previously shown deletable points from svg
    removeDeletablePoints() {
        if (this.inner_point_count == 1) {
            document.getElementById(this.id).remove();
        } else {
            for (var i = 0; i < this.rectangle_children.length; i++) {
                if (this.rectangle_children[i] != null) {
                    this.rectangle_children[i].removeDeletablePoints();
                }
            }
        }
    }

    // return the rectangle that id corresponds to
    returnInnerRectangle(id) {
        const path = rectangle.calculatePath(id);
        var length = path.length - 1;
        var rec = this;
        while (length >= 0) {
            rec = rec.rectangle_children[path[length]];
            length -= 1;
        }
        return rec;
    }

    // the function that does everything when we move the inner point
    moveInnerPoint(id, x, y) {
        var rectangle_selected = this;
        if (id != 0) {
            rectangle_selected = this.returnInnerRectangle(id);
        }
        rectangle_selected.movePoint(x, y);
        rectangle_selected.moveMovablePoints();
    }

    // the function that does everything when we delete a point
    deleteInnerPoint(id) {
        var rectangle_selected = this;
        rectangle_selected.inner_point_count -= 1;
        if (id != 0) {
            const path = rectangle.calculatePath(id);
            var length = path.length - 1;
            while (length >= 0) {
                rectangle_selected = rectangle_selected.rectangle_children[path[length]];
                length -= 1;
                rectangle_selected.inner_point_count -= 1;
            }
        }
        rectangle_selected.removeChildren();
        document.getElementById(rectangle_selected.id).remove();
        // this.removeDeletablePoints();
        this.showDeletablePoints();
    }


    // change the color of a rectangle
    // if no color is given, revert back to original color
    changeColor(id, color = "", add = false) {
        var rectangle_selected = this;
        if (id != 0) {
            rectangle_selected = this.returnInnerRectangle(id);
        }
        if (rectangle_selected.inner_point_count > 0) {
            // it can't be the one we want since it has children
            return -1;
        }
        // remove that element first because we want to change color
        // document.getElementById("rec_" + rectangle_selected.id).remove();

        if (color != "") {
            if (add) {
                rectangle_selected.color = color;
                for (var i = 0; i < rectangle_selected.rectangle_children.length; i++) {
                    if (rectangle_selected.rectangle_children[i] != null) {
                        rectangle_selected.rectangle_children[i].color = color;
                    }
                }
            }
            rectangle_selected.rect.setAttributeNS(null, "style", "fill: " + color + ";stroke-width: " + Math.ceil(rectangle_selected.stroke_width) + "; stroke: rgb(0, 0, 0);")
        } else {
            rectangle_selected.rect.setAttributeNS(null, "style", "fill: " + (rectangle_selected.color == "" ? "#ffffff" : rectangle_selected.color) + ";stroke-width: " + Math.ceil(rectangle_selected.stroke_width) + "; stroke: rgb(0, 0, 0);")
        }
        // this.svg.appendChild(rectangle_selected.rect);
        return rectangle_selected.id
    }

    changeColorByPosition(x, y, color = "", add = false) {
        if (x > this.x_start && x < this.x_start + this.width && y > this.y_start && y < this.y_start + this.height) {
            if (this.inner_point_count == 0) {
                // console.log("Change color", this.id, color);
                // document.getElementById("rec_" + this.id).remove();
                if (color != "") {
                    if (add) {
                        this.color = color;
                        for (var i = 0; i < this.rectangle_children.length; i++) {
                            if (this.rectangle_children[i] != null) {
                                this.rectangle_children[i].color = color;
                            }
                        }
                    }
                    this.rect.setAttributeNS(null, "style", "fill: " + color + ";stroke-width: " + Math.ceil(this.stroke_width) + "; stroke: rgb(0, 0, 0);")
                } else {
                    this.rect.setAttributeNS(null, "style", "fill: " + (this.color == "" ? "#ffffff" : this.color) + ";stroke-width: " + Math.ceil(this.stroke_width) + "; stroke: rgb(0, 0, 0);")
                }
                // this.svg.appendChild(this.rect);
                return this.id;
            }
            else {
                if (x < this.x_start + this.width * this.inner_point_x_percent) {
                    if (y < this.y_start + this.height * this.inner_point_y_percent) {
                        return this.rectangle_children[0].changeColorByPosition(x, y, color, add);
                    } else if (y > this.y_start + this.height * this.inner_point_y_percent) {
                        return this.rectangle_children[2].changeColorByPosition(x, y, color, add);
                    } else {
                        return -1;
                    }
                } else if (x > this.x_start + this.width * this.inner_point_x_percent) {
                    if (y < this.y_start + this.height * this.inner_point_y_percent) {
                        return this.rectangle_children[1].changeColorByPosition(x, y, color, add);
                    } else if (y > this.y_start + this.height * this.inner_point_y_percent) {
                        return this.rectangle_children[3].changeColorByPosition(x, y, color, add);
                    } else {
                        return -1;
                    }
                } else {
                    return -1;
                }
            }
        } else {
            return -1;
        }
    }

    exportPath(data = null) {
        if (data == null) {
            data = { type: "draw-rectangles-path", width: this.width, height: this.height, points: [], colors: {} }
        }
        if (this.inner_point_count > 0) {
            data.points.push({ x: this.x_start + this.inner_point_x_percent * this.width, y: this.y_start + this.inner_point_y_percent * this.height })
            data.colors[this.id] = this.color;
            for (var i = 0; i < this.rectangle_children.length; i++) {
                if (this.rectangle_children[i] != null) {
                    data = this.rectangle_children[i].exportPath(data);
                }
            }
        } else {
            data.colors[this.id] = this.color;
        }
        return data;
    }

}

module.exports = rectangle;