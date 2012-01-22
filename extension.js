const Meta = imports.gi.Meta;

var opacity_transparent = 128;
var opacity_opaque = 255;
var handled_window_types = [
  Meta.WindowType.NORMAL,
  Meta.WindowType.DESKTOP,
  Meta.WindowType.DOCK,
  Meta.WindowType.DIALOG,
  Meta.WindowType.MODAL_DIALOG,
  Meta.WindowType.TOOLBAR,
  Meta.WindowType.MENU,
  Meta.WindowType.UTILITY,
  Meta.WindowType.SPLASHSCREEN,

  /* override redirect window types: */
//  Meta.WindowType.DROPDOWN_MENU,
//  Meta.WindowType.POPUP_MENU,
//  Meta.WindowType.TOOLTIP,
  Meta.WindowType.NOTIFICATION,
  Meta.WindowType.COMBO,
  Meta.WindowType.DND,
  Meta.WindowType.OVERRIDE_OTHER
];

let on_window_created;
let on_restacked;

function init() {
}

function enable() {
    function overlaps(winA, winB) {
        if (!winA || !winB) {
            return false;
        }

        var rectA = winA.get_outer_rect();
        var rectB = winB.get_outer_rect();

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

    function setTransparent(window_actor) {
        window_actor.opacity = opacity_transparent;
    }

    function setOpaque(window_actor) {
        window_actor.opacity = opacity_opaque;
    }

    function handled_window_type(wtype) {
        for (var i = 0; i < handled_window_types.length; i++) {
            hwtype = handled_window_types[i];
            if (hwtype == wtype) {
                return true;
            } else if (hwtype > wtype) {
                return false;
            }
        }
        return false;
    }

    function updateOpacity(window_hint) {
        let above_current = new Array();

        global.get_window_actors().forEach(function(wa) {
            var meta_win = wa.get_meta_window();
            if (!meta_win) {
                return;
            }

            var wksp = meta_win.get_workspace();
            var wksp_index = wksp.index();
            var focused_meta_win = wksp._opacify_focused_window;

            if (above_current[wksp_index] &&
                overlaps(focused_meta_win, meta_win) &&
                handled_window_type(meta_win.get_window_type())) {
                setTransparent(wa);
            } else {
                setOpaque(wa);
            }
            if (meta_win == focused_meta_win) {
                /* for opacity calculations the window must *not* be
                 * considered above itself as it obviously overlaps
                 * itself and would always become transparent,
                 * so detect the fact *after* setting opacity
                 */
                above_current[wksp_index] = true;
            }
        });
    }

    function focus(the_window) {
        var wksp = the_window.get_workspace();
        wksp._opacify_focused_window = the_window;
        updateOpacity(the_window);
    }

    function window_created(__unused_display, the_window) {
        if (the_window) {
            the_window._opacify_on_focus = the_window.connect('focus', focus);
        }
    }

    on_window_created = global.display.connect('window-created', window_created);
    global.get_window_actors().forEach(function(wa) {
        window_created(null, wa.get_meta_window());
    });

    on_restacked = global.screen.connect('restacked', updateOpacity);
    updateOpacity();
}

function disable() {
    if (on_window_created) {
        global.display.disconnect(on_window_created);
    }
    if (on_restacked) {
        global.screen.disconnect(on_restacked);
    }
    global.get_window_actors().forEach(function(wa) {
        var win = wa.get_meta_window();
        if (win && win._opacify_on_focus) {
            win.disconnect(win._opacify_on_focus);
            delete win._opacify_on_focus;
        }
        wa.opacity = 255;
    });
}

