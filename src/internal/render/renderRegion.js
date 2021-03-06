
// Copyright: 2015 AlignAlytics
// License: "https://github.com/PMSI-AlignAlytics/scrollgrid/blob/master/MIT-LICENSE.txt"
// Source: /src/internal/render/renderRegion.js
Scrollgrid.prototype.internal.render.renderRegion = function (target, physicalOffset, xVirtual, yVirtual, clearCache) {
    "use strict";

    var self = this,
        int = self.internal,
        render = int.render,
        dom = int.dom,
        interaction = int.interaction,
        events = int.events,
        cells,
        metadata,
        bounds;

    if ((xVirtual.left || 0) !== (xVirtual.right || 0) && (yVirtual.top || 0) !== (yVirtual.bottom || 0)) {

        bounds = {
            startX: physicalOffset.x || 0,
            startY: physicalOffset.y || 0,
            top: yVirtual.top || 0,
            bottom: yVirtual.bottom || 0,
            left: xVirtual.left || 0,
            right: xVirtual.right || 0
        };

        metadata = render.getDataInBounds.call(self, bounds);

        // On refresh we will clear and redraw everything.  This can
        // be invoked externally or internally on full grid changes.  On scroll or resize
        // we don't want to clear the cache because affected cells will be redrawn anyway
        if (clearCache) {
            target.content
                .selectAll(".sg-no-style--cell-selector")
                .remove();
        }

        cells = target.content
            .selectAll(".sg-no-style--cell-selector")
            .data(metadata, function (d) {
                return d.key;
            });

        // We use the cell key to invoke an enter if the cell needs a render
        // for any reason, this means everything here happens on enter.
        cells.enter()
            .append("g")
            .attr("class", "sg-no-style--cell-selector")
            .each(function (d) {
                var group = d3.select(this);
                if (d.renderBackground) {
                    d.renderBackground.call(self, group, d);
                }
                render.renderSortIcon.call(self, d, group, !(!d.sortIcon || d.sortIcon === 'none'));
                // Add some interaction to the headers
                if (interaction.allowSorting && (target === dom.top || target === dom.top.left || target === dom.top.right)) {
                    interaction.addSortButtons.call(self, group, d);
                }

                // Register events
                events.addEventHandlers.call(self, group, d);
            });

        // Draw the foreground separately to allow for asynchronous adapters
        render.renderRegionForeground.call(this, bounds, cells);

        cells.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

        cells.exit()
            .remove();

    }
};
