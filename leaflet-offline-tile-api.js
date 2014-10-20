
    'use strict';

    // taken from https://github.com/SilviaTerra/offline_map_poc
    var tileUtils = function () {

        function pyramid(mapIDs, lat, lon, options) {
            /*
             Given a list of mapIDs, a central lat/lng, and zoomLimit/radius options
             generate the urls for the pyramid of tiles for zoom levels 3-17

             radius is how many tiles from the center at zoomLimit
             (by default
             zooms 3-14 have radius of 1.
             15 has radius 2
             16 has radius 4.
             17 has radius 8
             )
             */

            //handle options
            var zoomLimit = options['zoomLimit'] || 14;
            var minZoom = options['minZoom'] || 3;
            var maxZoom = options['maxZoom'] || 17;
            var radius = options['radius'] || 1;

            //declare vars outside of loop
            var urls = [], mapID, zoom, t_x, t_y, r, x, y;

            for (var i = 0, l = mapIDs.length; i < l; i++) { //iterate over map ids
                mapID = mapIDs[i];
                for (zoom = minZoom; zoom < maxZoom; zoom++) { //iterate over zoom levels
                    t_x = long2tile(lon, zoom);
                    t_y = lat2tile(lat, zoom);
                    r = radius * Math.pow(2, (Math.max(zoom, zoomLimit) - zoomLimit));
                    for (x = t_x - r; x <= t_x + r; x++) { //iterate over x's
                        for (y = t_y - r; y <= t_y + r; y++) { //iterate over y's
                            //urls.push(tile2url(mapID, zoom, x, y));
                            urls.push({"x":x,"y":y,"z":zoom});
                        }
                    }
                }
            }
            return urls;
        }

        function tile2url(mapID, zoom, x, y) {
            /*  Given a mapID, zoom, tile_x, and tile_y,
             *  return the url of that tile
             */
            return 'http://api.tiles.mapbox.com/v3/'
                    + mapID + '/' + zoom + '/'
                    + x + '/' + y + '.png';
        }

        //both from http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29
        function long2tile(lon, zoom) {
            return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
        }

        function lat2tile(lat, zoom) {
            return (Math.floor(
                            (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)
            ));
        }

        return {
            'pyramid': pyramid
        };

    }();

    Polymer({
        observe: {
            'storage': 'testPyramid'
        },
        testPyramid: function () {
            /**
            if (this.storage) {
                console.log('testPyramid');
                var x = tileUtils.pyramid('rbeers.j1mhej3b', 38.235261, -79.609084, {});
                //console.log(JSON.stringify(x, null, 2));
                for (var i = 0; i < x.length; ++i) {
                    this.downloadTile(x[i].x, x[i].y, x[i].z);
                }

            }**/
        },
        downloadTile: function(x, y, z) {
            var url = 'http://api.tiles.mapbox.com/v3/'
                    + 'rbeers.j1mhej3b' + '/' + z + '/'
                    + x + '/' + y + '.png';
            console.log('downloading tile: ' + url);

            var xhr = new XMLHttpRequest(),
                    fileReader = new FileReader();

            xhr.open('GET', url, true);
            xhr.responseType = 'blob';
            var self = this;
            xhr.addEventListener("load", function () {
                if (xhr.status === 200) {
                    // onload needed since Google Chrome doesn't support addEventListener for FileReader
                    fileReader.onload = function (evt) {
                        // Read out file contents as a Data URL
                        var result = evt.target.result;
                        console.log('filereader result: ', result);
                        self.saveTile(x, y, z, result);
                    };
                    // Load blob as Data URL
                    fileReader.readAsDataURL(xhr.response);
                }
            }, false);

            xhr.send();
        },
        saveTile: function(x, y, z, dataurl) {
            var key = z + ',' + y + ',' + x;
            console.log('saving tile with key: ' + key);
            this.storage.add(key, dataurl);
        }
    });
