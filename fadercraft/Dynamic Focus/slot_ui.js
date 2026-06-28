// slot_ui.js — JSUI view for one MIDI Learn slot (mgraphics).
//
// Draws: slot name label + horizontal value bar + percentage.
// Two-way sync with live.dial:
//   inlet 0 — normalized value (0.–1.) from live.dial → redraw only, no re-emit
//   inlet 1 — slot name string (optional, set at init)
// Outlet 0 — normalized value when the user drags → live.dial (bare number)

mgraphics.init();
mgraphics.relative_coords = 0;   // pixel coordinates, origin top-left
mgraphics.autofill = 0;
autowatch = 1;
inlets = 2;
outlets = 1;

var currentValue = 0.0;
var slotName = "Slot 1";
var dragging = false;
var dragStartX = 0;
var dragStartVal = 0;

function getsize() {
    return [box.rect[2] - box.rect[0], box.rect[3] - box.rect[1]];
}

// ── Drawing ───────────────────────────────────────────────────────────
function paint() {
    var s = getsize();
    var w = s[0], h = s[1];

    with (mgraphics) {
        // background
        set_source_rgba(0.15, 0.15, 0.15, 1.0);
        rectangle(0, 0, w, h);
        fill();

        var barX = 4;
        var barY = h * 0.55;
        var barW = w - 8;
        var barH = h * 0.30;

        // bar track
        set_source_rgba(0.25, 0.25, 0.25, 1.0);
        rectangle(barX, barY, barW, barH);
        fill();

        // bar fill
        set_source_rgba(0.30, 0.65, 1.0, 1.0);
        rectangle(barX, barY, barW * currentValue, barH);
        fill();

        // slot name
        select_font_face("Arial");
        set_font_size(11);
        set_source_rgba(0.85, 0.85, 0.85, 1.0);
        move_to(4, 16);
        show_text(slotName);

        // percentage (right side)
        set_source_rgba(0.65, 0.65, 0.65, 1.0);
        var pct = Math.round(currentValue * 100) + "%";
        move_to(w - 38, 16);
        show_text(pct);
    }
}

// ── Inlet 0: value update from live.dial (redraw only, no re-emit) ────
function msg_float(v) {
    if (inlet === 0) {
        currentValue = Math.max(0.0, Math.min(1.0, v));
        mgraphics.redraw();
    }
}
function msg_int(v) { msg_float(v); }

// ── Inlet 1: slot name ───────────────────────────────────────────────
function name(s) {
    slotName = s;
    mgraphics.redraw();
}

// ── Mouse drag → emit to live.dial ───────────────────────────────────
function onclick(x, y) {
    dragging = true;
    dragStartX = x;
    dragStartVal = currentValue;
}
function ondrag(x, y) {
    if (!dragging) return;
    var w = getsize()[0];
    var dx = (x - dragStartX) / (w - 8);
    currentValue = Math.max(0.0, Math.min(1.0, dragStartVal + dx));
    mgraphics.redraw();
    outlet(0, currentValue);     // → live.dial (bare → dial outputs → back here = redraw, no loop)
}
function onrelease(x, y) {
    dragging = false;
}
