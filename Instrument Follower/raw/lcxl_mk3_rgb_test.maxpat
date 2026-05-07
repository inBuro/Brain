{
	"patcher" : 	{
		"fileversion" : 1,
		"appversion" : 		{
			"major" : 8,
			"minor" : 5,
			"revision" : 0,
			"architecture" : "x64",
			"modernui" : 1
		},
		"classnamespace" : "box",
		"rect" : [ 100.0, 100.0, 760.0, 520.0 ],
		"bglocked" : 0,
		"openinpresentation" : 0,
		"default_fontsize" : 12.0,
		"default_fontface" : 0,
		"default_fontname" : "Arial",
		"gridonopen" : 1,
		"gridsize" : [ 15.0, 15.0 ],
		"gridsnaponopen" : 1,
		"objectsnaponopen" : 1,
		"statusbarvisible" : 2,
		"toolbarvisible" : 1,
		"boxes" : [
			{
				"box" : {
					"fontface" : 1,
					"fontsize" : 16.0,
					"id" : "obj-title",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 20.0, 15.0, 500.0, 26.0 ],
					"text" : "LCXL MK3 — RGB SysEx Test"
				}
			},
			{
				"box" : {
					"id" : "obj-lbl-idx",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 20.0, 70.0, 130.0, 22.0 ],
					"text" : "Encoder index:"
				}
			},
			{
				"box" : {
					"id" : "obj-idx",
					"maxclass" : "number",
					"minimum" : 0,
					"maximum" : 127,
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "bang" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 160.0, 70.0, 60.0, 22.0 ]
				}
			},
			{
				"box" : {
					"id" : "obj-lbl-r",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 20.0, 105.0, 130.0, 22.0 ],
					"text" : "R (0-127):"
				}
			},
			{
				"box" : {
					"id" : "obj-r",
					"maxclass" : "number",
					"minimum" : 0,
					"maximum" : 127,
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "bang" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 160.0, 105.0, 60.0, 22.0 ]
				}
			},
			{
				"box" : {
					"id" : "obj-lbl-g",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 20.0, 140.0, 130.0, 22.0 ],
					"text" : "G (0-127):"
				}
			},
			{
				"box" : {
					"id" : "obj-g",
					"maxclass" : "number",
					"minimum" : 0,
					"maximum" : 127,
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "bang" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 160.0, 140.0, 60.0, 22.0 ]
				}
			},
			{
				"box" : {
					"id" : "obj-lbl-b",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 20.0, 175.0, 130.0, 22.0 ],
					"text" : "B (0-127):"
				}
			},
			{
				"box" : {
					"id" : "obj-b",
					"maxclass" : "number",
					"minimum" : 0,
					"maximum" : 127,
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "bang" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 160.0, 175.0, 60.0, 22.0 ]
				}
			},
			{
				"box" : {
					"id" : "obj-send-btn",
					"maxclass" : "button",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "bang" ],
					"patching_rect" : [ 20.0, 220.0, 32.0, 32.0 ]
				}
			},
			{
				"box" : {
					"fontface" : 1,
					"id" : "obj-lbl-send",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 60.0, 226.0, 250.0, 22.0 ],
					"text" : "Send Color"
				}
			},
			{
				"box" : {
					"id" : "obj-msg",
					"maxclass" : "message",
					"numinlets" : 5,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 20.0, 270.0, 380.0, 22.0 ],
					"text" : "240 0 32 41 2 21 1 53 $1 $2 $3 $4 247"
				}
			},
			{
				"box" : {
					"id" : "obj-midiout",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 20.0, 380.0, 280.0, 22.0 ],
					"text" : "midiout \"Launch Control XL 3\""
				}
			},
			{
				"box" : {
					"id" : "obj-daw-btn",
					"maxclass" : "button",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "bang" ],
					"patching_rect" : [ 420.0, 70.0, 32.0, 32.0 ]
				}
			},
			{
				"box" : {
					"fontface" : 1,
					"id" : "obj-daw-lbl",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 460.0, 76.0, 250.0, 22.0 ],
					"text" : "Enable DAW mode"
				}
			},
			{
				"box" : {
					"id" : "obj-daw-msg",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 420.0, 115.0, 200.0, 22.0 ],
					"text" : "159 11 127"
				}
			},
			{
				"box" : {
					"fontsize" : 11.0,
					"id" : "obj-instructions",
					"linecount" : 11,
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 420.0, 160.0, 320.0, 165.0 ],
					"text" : "How to test:\n1. Plug LCXL MK3 in.\n2. Click 'Send Color' with idx=0, R=127, G=0, B=0.\n3. If nothing happens, try other idx values\n   (top row encoders ~ 13-20 in DAW mode).\n4. If still nothing, click 'Enable DAW mode' first,\n   then try Send Color again.\n5. If still nothing, the midiout port name may differ.\n   Open Max console and check [midiinfo @output 1] —\n   replace the name in the midiout object accordingly."
				}
			},
			{
				"box" : {
					"fontsize" : 10.0,
					"id" : "obj-spec",
					"linecount" : 3,
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 20.0, 300.0, 380.0, 45.0 ],
					"text" : "SysEx: F0 00 20 29 02 15 01 53 <idx> <R> <G> <B> F7\nManufacturer Novation (00 20 29), product LCXL3 (02 15),\ncommand 'set LED colour' (01 53)."
				}
			}
		],
		"lines" : [
			{
				"patchline" : {
					"destination" : [ "obj-msg", 1 ],
					"source" : [ "obj-idx", 0 ]
				}
			},
			{
				"patchline" : {
					"destination" : [ "obj-msg", 2 ],
					"source" : [ "obj-r", 0 ]
				}
			},
			{
				"patchline" : {
					"destination" : [ "obj-msg", 3 ],
					"source" : [ "obj-g", 0 ]
				}
			},
			{
				"patchline" : {
					"destination" : [ "obj-msg", 4 ],
					"source" : [ "obj-b", 0 ]
				}
			},
			{
				"patchline" : {
					"destination" : [ "obj-msg", 0 ],
					"source" : [ "obj-send-btn", 0 ]
				}
			},
			{
				"patchline" : {
					"destination" : [ "obj-midiout", 0 ],
					"source" : [ "obj-msg", 0 ]
				}
			},
			{
				"patchline" : {
					"destination" : [ "obj-daw-msg", 0 ],
					"source" : [ "obj-daw-btn", 0 ]
				}
			},
			{
				"patchline" : {
					"destination" : [ "obj-midiout", 0 ],
					"source" : [ "obj-daw-msg", 0 ]
				}
			}
		]
	}
}
