import numpy as np
import scipy
from scipy import ndimage
import imageio
from multiprocessing import Pool
import json

GAP_SIZE = 10
MINIMUM_THRESHOLD = 0.5
SIGMA = 5


def rgb2gray(rgb):
    return np.dot(rgb[..., :3], [0.299, 0.587, 0.144])


def sobel(file):
    im = imageio.imread(file)
    gray = rgb2gray(im)
    gray = gray.astype('int32')
    gray = ndimage.gaussian_filter(gray, sigma=SIGMA)
    dx = ndimage.sobel(gray, 0)  # horizontal derivative
    dy = ndimage.sobel(gray, 1)  # vertical derivative
    mag = np.hypot(dx, dy)   # magnitude
    mag *= 255.0 / np.max(mag)  # normalize (Q&D)
    # mag += gray.astype("float64") / 255
    # mag *= 255.0 / np.max(mag)  # normalize (Q&D)
    return mag.T


def computeRegionHex(img, x_start, y_start, x_end, y_end):
    area = (x_end - x_start) * (y_end - y_start)
    if area == 0:
        area = 1
    r = int(img[x_start:x_end, y_start:y_end, 0].sum() * 1.0 / area)
    g = int(img[x_start:x_end, y_start:y_end, 1].sum() * 1.0 / area)
    b = int(img[x_start:x_end, y_start:y_end, 2].sum() * 1.0 / area)
    return '#%02x%02x%02x' % (r, g, b)


def row_compute_values(slice, x_start, y_start, x_end, y_end, level, i, id):
    best_point = (-1, -1)
    best_weight = -1
    for j in range(int(GAP_SIZE), y_end - y_start - int(GAP_SIZE), GAP_SIZE):
        # we want to compute the weight of the four region
        # if we decide to use this point as a cut
        results = [0, 0, 0, 0]
        results[0] = slice[0:i, 0:j].sum() * 1.0 / (i * j)
        results[1] = slice[i:x_end - x_start, 0:j].sum() * \
            1.0 / ((x_end - x_start - i) * j)
        results[2] = slice[0:i, j: y_end - y_start].sum() * 1.0 / \
            (i * (y_end - y_start - j))
        results[3] = slice[i:x_end - x_start, j: y_end - y_start].sum() * 1.0 / (
            (x_end - x_start - i) * (y_end - y_start - j))

        # compute the local minimum, we want the minimum to be larger than maximum
        local_minimum = float("inf")
        for k in range(4):
            for l in range(k+1, 4):
                if abs(results[k] - results[l]) < local_minimum:
                    local_minimum = abs(results[k] - results[l])

        # now if local minimum is better than best weight
        if local_minimum > best_weight:
            best_point = (x_start + i, y_start + j)
            best_weight = local_minimum
    # if it is 0 somehow, return the weight as -1
    if (best_weight <= MINIMUM_THRESHOLD):
        return {"x_start": x_start, "x_end": x_end, "y_start": y_start, "y_end": y_end, "level": level, "weight": -1, "x": -1, "y": -1, "id": id}
    else:
        # else return the data
        print("Row:", i, ", width:", x_end - x_start, ", weight:", best_weight)
        return {"x_start": x_start, "x_end": x_end, "y_start": y_start, "y_end": y_end, "level": level, "weight": best_weight, "x": best_point[0], "y": best_point[1], "id": id}


def choosePoint(img, x_start, y_start, x_end, y_end, level, id):
    x_start = int(x_start)
    x_end = int(x_end)
    y_start = int(y_start)
    y_end = int(y_end)
    if level >= 24:
        # too many levels
        return {"x_start": x_start, "x_end": x_end, "y_start": y_start, "y_end": y_end, "level": level, "weight": -1, "x": -1, "y": -1, "id": id}
    if (x_end - x_start < GAP_SIZE or y_end - y_start < GAP_SIZE):
        # block too small
        return {"x_start": x_start, "x_end": x_end, "y_start": y_start, "y_end": y_end, "level": level, "weight": -1, "x": -1, "y": -1, "id": id}

    # now we want to get the portion of the image
    slice = img[x_start:x_end, y_start: y_end]
    arguments = []
    for i in range(int(GAP_SIZE), x_end - x_start - int(GAP_SIZE), GAP_SIZE):
        arguments.append((slice, x_start, y_start, x_end, y_end, level, i, id))

    with Pool(20) as pool:
        results = pool.starmap(row_compute_values, arguments)
        # we want the highest result
        results = sorted(results, key=lambda x: x["weight"], reverse=True)
        if (len(results) == 0):
            return {"x_start": x_start, "x_end": x_end, "y_start": y_start, "y_end": y_end, "level": level, "weight": -1, "x": -1, "y": -1, "id": id}
        return results[0]


def processImage(file):
    sobel_image = sobel(file)
    original = imageio.imread(file, pilmode="RGB").transpose(1, 0, 2)
    width = sobel_image.shape[0]
    height = sobel_image.shape[1]

    queue = []
    points = []
    r = choosePoint(sobel_image, 0, 0, width, height, 0, 0)
    colors = {}
    if (r["weight"] > 0):
        # append the works
        queue.append(r)
        points.append({"x": r["x"], "y": r["y"]})
    else:
        colors[str(r["id"])] = computeRegionHex(
            original, 0, 0, width, height)

    while len(queue) != 0:
        split_point = queue.pop()
        id = split_point["id"]

        r = choosePoint(sobel_image, split_point["x_start"], split_point["y_start"],
                        split_point["x"], split_point["y"], split_point["level"] + 1, id*4 + 1)
        if r["weight"] > 0:
            queue.append(r)
            points.append({"x": r["x"], "y": r["y"]})
        else:
            colors[str(r["id"])] = computeRegionHex(
                original, r["x_start"], r["y_start"], r["x_end"], r["y_end"])

        r = choosePoint(sobel_image, split_point["x"], split_point["y_start"],
                        split_point["x_end"], split_point["y"], split_point["level"] + 1, id*4 + 2)
        if r["weight"] > 0:
            queue.append(r)
            points.append({"x": r["x"], "y": r["y"]})
        else:
            colors[str(r["id"])] = computeRegionHex(
                original, r["x_start"], r["y_start"], r["x_end"], r["y_end"])

        r = choosePoint(sobel_image, split_point["x_start"], split_point["y"], split_point["x"],
                        split_point["y_end"], split_point["level"] + 1, id*4 + 3)
        if r["weight"] > 0:
            queue.append(r)
            points.append({"x": r["x"], "y": r["y"]})
        else:
            colors[str(r["id"])] = computeRegionHex(
                original, r["x_start"], r["y_start"], r["x_end"], r["y_end"])

        r = choosePoint(sobel_image, split_point["x"], split_point["y"], split_point["x_end"],
                        split_point["y_end"], split_point["level"] + 1, id*4 + 4)
        if r["weight"] > 0:
            queue.append(r)
            points.append({"x": r["x"], "y": r["y"]})
        else:
            colors[str(r["id"])] = computeRegionHex(
                original, r["x_start"], r["y_start"], r["x_end"], r["y_end"])

    print(width, height)
    print(points)
    print(colors)

    json_result = {}
    json_result["type"] = "draw-rectangles-path"
    json_result["width"] = width
    json_result["height"] = height
    json_result["points"] = points
    json_result["colors"] = colors

    out_file = open("path.json", "w")
    json.dump(json_result, out_file)
    out_file.close()


processImage("light.jpg")
