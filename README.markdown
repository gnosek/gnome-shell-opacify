Opacify for Gnome Shell extension
=================================

This extension implements core of the compiz Opacify plugin, i.e. inactive windows obscuring active ones are made semi-transparent. It works best with focus-follows-mouse policy but without auto-raise, i.e.:

    gconftool-2 --type string --set /apps/metacity/general/focus_mode mouse
    gconftool-2 --type boolean --set /apps/metacity/general/auto_raise false

Due to limitations of the Gnome Shell (as of 3.2), the extension is not easily configurable and the inactive opacity is hardcoded at 50%. To change it, edit the line saying:

    var opacity_transparent = 128;

to anything you want (0 is invisible, 255 is fully opaque).

Note: This extension will probably break anything else that wants to alter individual windows' opacities by resetting them at every window focus change.
