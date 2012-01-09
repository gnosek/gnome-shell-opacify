let on_window_created;

function init() {
}

function reset_opacity() {
    global.get_window_actors().forEach(function(wa) {
        wa.opacity = 255;
    });
}

function enable() {
    function overlaps(rectA, rectB) {
        var a_x1 = rectA.x;
        var a_x2 = rectA.x + rectA.width;
        var a_y1 = rectA.y;
        var a_y2 = rectA.y + rectA.height;

        var b_x1 = rectB.x;
        var b_x2 = rectB.x + rectB.width;
        var b_y1 = rectB.y;
        var b_y2 = rectB.y + rectB.height;

        // I'm lazy, sosumi
        // http://stackoverflow.com/a/306332
        return (a_x1 < b_x2 && a_x2 > b_x1 && a_y1 < b_y2 && a_y2 > b_y1);
    }

    function window_created(__unused_display, the_window) {
        var on_focus = the_window.connect('focus', function(the_window) {
            var r = the_window.get_outer_rect();
            var all_windows = global.get_window_actors();
            var above_current = true;

            for (var i = all_windows.length - 1; i >= 0; i--) {
                var actor = all_windows[i];
                var meta_window = actor.get_meta_window();
                if (meta_window == the_window) {
                    above_current = false;
                    actor.opacity = 255;
                    continue;
                }
                var mr = meta_window.get_outer_rect();
                if (above_current && overlaps(r, mr)) {
                    actor.opacity = 128;
                } else {
                    actor.opacity = 255;
                }
            }
        });

        var on_raised = the_window.connect('raised', reset_opacity);

        the_window._opacify = {
            on_focus: on_focus,
            on_raised: on_raised
        };
    }

    on_window_created = global.display.connect('window-created', window_created);
    global.get_window_actors().forEach(function(wa) {
        window_created(null, wa.get_meta_window());
    });
}

function disable() {
    if (on_window_created) {
        global.display.disconnect(on_window_created);
    }
    global.get_window_actors().forEach(function(wa) {
        var win = wa.get_meta_window();
        var handlers = win._opacify;
        if (handlers) {
            for (var name in handlers) {
                win.disconnect(handlers[name]);
            }
        }
        wa.opacity = 255;
    });
}

