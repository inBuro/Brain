{
 "patcher": {
  "fileversion": 1,
  "appversion": {
   "major": 9,
   "minor": 1,
   "revision": 4,
   "architecture": "x64",
   "modernui": 1
  },
  "classnamespace": "box",
  "rect": [
   80.0,
   105.0,
   420.0,
   380.0
  ],
  "openrect": [
   0.0,
   0.0,
   320.0,
   240.0
  ],
  "openinpresentation": 0,
  "default_fontsize": 12.0,
  "default_fontname": "Arial",
  "gridonopen": 1,
  "gridsize": [
   8.0,
   8.0
  ],
  "boxes": [
   {
    "box": {
     "id": "obj_title",
     "maxclass": "comment",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      16.0,
      12.0,
      240.0,
      20.0
     ],
     "text": "Dynamic Focus \u2014 Track-Focus PoC"
    }
   },
   {
    "box": {
     "id": "obj_sub",
     "maxclass": "comment",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      16.0,
      32.0,
      360.0,
      20.0
     ],
     "text": "Active only while THIS track is selected. No central manager."
    }
   },
   {
    "box": {
     "id": "obj_enable",
     "maxclass": "toggle",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      16.0,
      64.0,
      24.0,
      24.0
     ],
     "outlettype": [
      "int"
     ]
    }
   },
   {
    "box": {
     "id": "obj_enable_lbl",
     "maxclass": "comment",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      48.0,
      68.0,
      60.0,
      18.0
     ],
     "text": "Enable"
    }
   },
   {
    "box": {
     "id": "obj_loadbang",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      120.0,
      64.0,
      64.0,
      22.0
     ],
     "text": "loadbang",
     "outlettype": [
      "bang"
     ]
    }
   },
   {
    "box": {
     "id": "obj_one",
     "maxclass": "message",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      120.0,
      96.0,
      32.0,
      22.0
     ],
     "text": "1"
    }
   },
   {
    "box": {
     "id": "obj_js",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      16.0,
      132.0,
      150.0,
      22.0
     ],
     "saved_object_attributes": {
      "filename": "dynamic_focus.js",
      "parameter_enable": 0
     },
     "text": "js dynamic_focus.js"
    }
   },
   {
    "box": {
     "id": "obj_led",
     "maxclass": "toggle",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      16.0,
      180.0,
      32.0,
      32.0
     ],
     "outlettype": [
      "int"
     ]
    }
   },
   {
    "box": {
     "id": "obj_led_lbl",
     "maxclass": "comment",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      56.0,
      188.0,
      220.0,
      18.0
     ],
     "text": "ACTIVE (host track is selected)"
    }
   },
   {
    "box": {
     "id": "obj_midiin",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      16.0,
      240.0,
      48.0,
      22.0
     ],
     "text": "midiin",
     "outlettype": [
      "int"
     ]
    }
   },
   {
    "box": {
     "id": "obj_gate",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 1,
     "patching_rect": [
      16.0,
      280.0,
      60.0,
      22.0
     ],
     "text": "gate",
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "obj_midiout",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      16.0,
      320.0,
      56.0,
      22.0
     ],
     "text": "midiout"
    }
   },
   {
    "box": {
     "id": "obj_gate_lbl",
     "maxclass": "comment",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      88.0,
      284.0,
      220.0,
      18.0
     ],
     "text": "MIDI passes only while ACTIVE"
    }
   }
  ],
  "lines": [
   {
    "patchline": {
     "source": [
      "obj_loadbang",
      0
     ],
     "destination": [
      "obj_one",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj_one",
      0
     ],
     "destination": [
      "obj_js",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj_enable",
      0
     ],
     "destination": [
      "obj_js",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj_js",
      0
     ],
     "destination": [
      "obj_gate",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj_js",
      0
     ],
     "destination": [
      "obj_led",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj_midiin",
      0
     ],
     "destination": [
      "obj_gate",
      1
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj_gate",
      0
     ],
     "destination": [
      "obj_midiout",
      0
     ]
    }
   }
  ],
  "parameters": {},
  "dependency_cache": [
   {
    "name": "dynamic_focus.js",
    "bootpath": "~",
    "type": "TEXT",
    "implicit": 1
   }
  ],
  "autosave": 0,
  "is_mpe": 0,
  "minimum_live_version": "11.0",
  "minimum_max_version": "8.5.0",
  "platform_compatibility": 3
 }
}