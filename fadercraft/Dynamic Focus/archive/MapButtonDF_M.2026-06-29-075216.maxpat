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
   782.0,
   338.0,
   583.0,
   600.0
  ],
  "openinpresentation": 1,
  "default_fontsize": 10.0,
  "gridsize": [
   8.0,
   8.0
  ],
  "boxes": [
   {
    "box": {
     "annotation": "Unmaps the currently mapped parameter.",
     "annotation_name": "Unmap",
     "appearance": 2,
     "fontsize": 6.0,
     "hidden": 1,
     "id": "obj-28",
     "maxclass": "live.text",
     "mode": 0,
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      ""
     ],
     "parameter_enable": 1,
     "patching_rect": [
      356.3333439528942,
      334.0000099539757,
      25.0,
      25.0
     ],
     "pictures": [
      "multimap-unmap.svg",
      "multimap-unmap.svg"
     ],
     "presentation": 1,
     "presentation_rect": [
      100.82303628325462,
      2.0576129853725433,
      15.0,
      15.0
     ],
     "remapsvgcolors": 1,
     "saved_attribute_attributes": {
      "valueof": {
       "parameter_enum": [
        "val1",
        "val2"
       ],
       "parameter_invisible": 2,
       "parameter_longname": "Unmap[11]",
       "parameter_mmax": 1,
       "parameter_modmode": 0,
       "parameter_shortname": "Unmap",
       "parameter_type": 2
      }
     },
     "text": "X",
     "texton": "x",
     "usepicture": 1,
     "usesvgviewbox": 1,
     "varname": "live.text[1]"
    }
   },
   {
    "box": {
     "activebgcolor": [
      1.0,
      0.71,
      0.196,
      0.0
     ],
     "activebgoncolor": [
      1.0,
      0.71,
      0.196,
      1.0
     ],
     "activetextcolor": [
      1.0,
      0.71,
      0.196,
      1.0
     ],
     "annotation": "When Map is turned on, the next Live parameter clicked on will be selected as a target and the menus wil be modified accordingly.   ",
     "annotation_name": "Map Parameter",
     "appearance": 2,
     "bgcolor": [
      1.0,
      0.709804,
      0.196078,
      0.0
     ],
     "bgoncolor": [
      1.0,
      0.709804,
      0.196078,
      1.0
     ],
     "bordercolor": [
      1.0,
      0.709804,
      0.196078,
      1.0
     ],
     "focusbordercolor": [
      0.792156862745098,
      0.7490196078431373,
      0.6980392156862745,
      1.0
     ],
     "id": "obj-14",
     "lcdcolor": [
      1.0,
      0.6784313725490196,
      0.33725490196078434,
      1.0
     ],
     "maxclass": "live.text",
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      ""
     ],
     "parameter_enable": 1,
     "patching_rect": [
      20.081966638565063,
      130.73770117759705,
      122.13114404678345,
      18.852458477020264
     ],
     "presentation": 1,
     "presentation_rect": [
      2.469135582447052,
      2.0576129853725433,
      96.70781031250954,
      14.814813494682312
     ],
     "saved_attribute_attributes": {
      "activebgcolor": {
       "expression": ""
      },
      "activebgoncolor": {
       "expression": ""
      },
      "activetextcolor": {
       "expression": ""
      },
      "bgcolor": {
       "expression": ""
      },
      "bgoncolor": {
       "expression": ""
      },
      "bordercolor": {
       "expression": ""
      },
      "focusbordercolor": {
       "expression": ""
      },
      "lcdcolor": {
       "expression": "themecolor.live_control_selection"
      },
      "textcolor": {
       "expression": ""
      },
      "textoffcolor": {
       "expression": ""
      },
      "valueof": {
       "parameter_enum": [
        "val1",
        "val2"
       ],
       "parameter_invisible": 2,
       "parameter_longname": "Map[11]",
       "parameter_mmax": 1,
       "parameter_modmode": 0,
       "parameter_shortname": "Map",
       "parameter_type": 2
      },
      "inactivelcdcolor": {
       "expression": "themecolor.live_control_selection"
      }
     },
     "text": "Map Parameter",
     "textcolor": [
      1.0,
      0.709804,
      0.196078,
      1.0
     ],
     "textoffcolor": [
      1.0,
      0.709804,
      0.196078,
      1.0
     ],
     "texton": "Map Parameter",
     "varname": "live.text"
    }
   },
   {
    "box": {
     "comment": "paramLabel (sym)",
     "id": "in_label",
     "index": 0,
     "maxclass": "inlet",
     "numinlets": 0,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      20.0,
      20.0,
      25.0,
      25.0
     ]
    }
   },
   {
    "box": {
     "comment": "min (int 0-100)",
     "id": "in_min",
     "index": 0,
     "maxclass": "inlet",
     "numinlets": 0,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      80.0,
      20.0,
      25.0,
      25.0
     ]
    }
   },
   {
    "box": {
     "comment": "max (int 0-100)",
     "id": "in_max",
     "index": 0,
     "maxclass": "inlet",
     "numinlets": 0,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      140.0,
      20.0,
      25.0,
      25.0
     ]
    }
   },
   {
    "box": {
     "comment": "mapped 0/1",
     "id": "in_mapped",
     "index": 0,
     "maxclass": "inlet",
     "numinlets": 0,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      200.0,
      20.0,
      25.0,
      25.0
     ]
    }
   },
   {
    "box": {
     "comment": "pct value (int 0-100)",
     "id": "in_pct",
     "index": 0,
     "maxclass": "inlet",
     "numinlets": 0,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      260.0,
      20.0,
      25.0,
      25.0
     ]
    }
   },
   {
    "box": {
     "comment": "mapparam bang",
     "id": "out_map",
     "index": 0,
     "maxclass": "outlet",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      20.0,
      700.0,
      25.0,
      25.0
     ]
    }
   },
   {
    "box": {
     "comment": "min value",
     "id": "out_min",
     "index": 0,
     "maxclass": "outlet",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      80.0,
      700.0,
      25.0,
      25.0
     ]
    }
   },
   {
    "box": {
     "comment": "max value",
     "id": "out_max",
     "index": 0,
     "maxclass": "outlet",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      140.0,
      700.0,
      25.0,
      25.0
     ]
    }
   },
   {
    "box": {
     "comment": "clear bang",
     "id": "out_clear",
     "index": 0,
     "maxclass": "outlet",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      200.0,
      700.0,
      25.0,
      25.0
     ]
    }
   },
   {
    "box": {
     "fontname": "Arial Bold",
     "fontsize": 10.0,
     "id": "setText1",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
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
       537.0,
       306.0,
       640.0,
       480.0
      ],
      "default_fontsize": 10.0,
      "default_fontname": "Arial Bold",
      "gridsize": [
       8.0,
       8.0
      ],
      "boxes": [
       {
        "box": {
         "id": "obj-42",
         "linecount": 2,
         "maxclass": "comment",
         "numinlets": 1,
         "numoutlets": 0,
         "patching_rect": [
          160.0,
          140.0,
          154.0,
          29.0
         ],
         "text": "truncate text if longer than 12 characters"
        }
       },
       {
        "box": {
         "id": "obj-40",
         "maxclass": "newobj",
         "numinlets": 2,
         "numoutlets": 2,
         "outlettype": [
          "",
          ""
         ],
         "patching_rect": [
          50.0,
          238.0,
          53.0,
          20.0
         ],
         "text": "zl join"
        }
       },
       {
        "box": {
         "id": "obj-35",
         "maxclass": "newobj",
         "numinlets": 3,
         "numoutlets": 1,
         "outlettype": [
          "int"
         ],
         "patching_rect": [
          50.0,
          277.0,
          40.0,
          20.0
         ],
         "text": "itoa"
        }
       },
       {
        "box": {
         "id": "obj-30",
         "maxclass": "newobj",
         "numinlets": 1,
         "numoutlets": 2,
         "outlettype": [
          "",
          "zlclear"
         ],
         "patching_rect": [
          50.0,
          109.0,
          53.0,
          20.0
         ],
         "text": "t l zlclear"
        }
       },
       {
        "box": {
         "id": "obj-28",
         "maxclass": "message",
         "numinlets": 2,
         "numoutlets": 1,
         "outlettype": [
          ""
         ],
         "patching_rect": [
          116.0,
          201.0,
          49.0,
          20.0
         ],
         "text": "46 46 46"
        }
       },
       {
        "box": {
         "id": "obj-25",
         "maxclass": "button",
         "numinlets": 1,
         "numoutlets": 1,
         "outlettype": [
          "bang"
         ],
         "parameter_enable": 0,
         "patching_rect": [
          116.0,
          171.0,
          24.0,
          24.0
         ]
        }
       },
       {
        "box": {
         "id": "obj-11",
         "maxclass": "newobj",
         "numinlets": 2,
         "numoutlets": 2,
         "outlettype": [
          "",
          ""
         ],
         "patching_rect": [
          50.0,
          140.0,
          57.0,
          20.0
         ],
         "text": "zl slice 12"
        }
       },
       {
        "box": {
         "id": "obj-1",
         "maxclass": "newobj",
         "numinlets": 3,
         "numoutlets": 1,
         "outlettype": [
          "list"
         ],
         "patching_rect": [
          50.0,
          80.0,
          40.0,
          20.0
         ],
         "text": "atoi"
        }
       },
       {
        "box": {
         "fontname": "Arial Bold",
         "fontsize": 10.0,
         "id": "obj-10",
         "maxclass": "message",
         "numinlets": 2,
         "numoutlets": 1,
         "outlettype": [
          ""
         ],
         "patching_rect": [
          50.0,
          324.433533,
          92.0,
          20.0
         ],
         "text": "text $1, texton $1"
        }
       },
       {
        "box": {
         "comment": "",
         "id": "obj-20",
         "index": 1,
         "maxclass": "inlet",
         "numinlets": 0,
         "numoutlets": 1,
         "outlettype": [
          ""
         ],
         "patching_rect": [
          50.0,
          40.0,
          25.0,
          25.0
         ]
        }
       },
       {
        "box": {
         "comment": "",
         "id": "obj-22",
         "index": 1,
         "maxclass": "outlet",
         "numinlets": 1,
         "numoutlets": 0,
         "patching_rect": [
          50.0,
          357.433533,
          25.0,
          25.0
         ]
        }
       }
      ],
      "lines": [
       {
        "patchline": {
         "destination": [
          "obj-30",
          0
         ],
         "source": [
          "obj-1",
          0
         ]
        }
       },
       {
        "patchline": {
         "destination": [
          "obj-22",
          0
         ],
         "source": [
          "obj-10",
          0
         ]
        }
       },
       {
        "patchline": {
         "destination": [
          "obj-25",
          0
         ],
         "source": [
          "obj-11",
          1
         ]
        }
       },
       {
        "patchline": {
         "destination": [
          "obj-40",
          0
         ],
         "source": [
          "obj-11",
          0
         ]
        }
       },
       {
        "patchline": {
         "destination": [
          "obj-1",
          0
         ],
         "source": [
          "obj-20",
          0
         ]
        }
       },
       {
        "patchline": {
         "destination": [
          "obj-28",
          0
         ],
         "source": [
          "obj-25",
          0
         ]
        }
       },
       {
        "patchline": {
         "destination": [
          "obj-40",
          1
         ],
         "source": [
          "obj-28",
          0
         ]
        }
       },
       {
        "patchline": {
         "destination": [
          "obj-11",
          0
         ],
         "source": [
          "obj-30",
          0
         ]
        }
       },
       {
        "patchline": {
         "destination": [
          "obj-40",
          1
         ],
         "source": [
          "obj-30",
          1
         ]
        }
       },
       {
        "patchline": {
         "destination": [
          "obj-10",
          0
         ],
         "source": [
          "obj-35",
          0
         ]
        }
       },
       {
        "patchline": {
         "destination": [
          "obj-35",
          0
         ],
         "source": [
          "obj-40",
          0
         ]
        }
       }
      ]
     },
     "patching_rect": [
      20.0,
      80.0,
      54.0,
      20.0
     ],
     "saved_object_attributes": {
      "fontname": "Arial Bold",
      "fontsize": 10.0
     },
     "text": "p setText"
    }
   },
   {
    "box": {
     "id": "pset_pct",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      160.0,
      100.0,
      65.0,
      20.0
     ],
     "text": "prepend set"
    }
   },
   {
    "box": {
     "activebgcolor": [
      0.0784313725490196,
      0.058823529411764705,
      0.047058823529411764,
      1.0
     ],
     "bordercolor": [
      0.0784313725490196,
      0.058823529411764705,
      0.047058823529411764,
      1.0
     ],
     "focusbordercolor": [
      1.0,
      0.6784313725490196,
      0.33725490196078434,
      1.0
     ],
     "id": "nbox_min",
     "maxclass": "live.numbox",
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      "float"
     ],
     "parameter_enable": 1,
     "patching_rect": [
      220.0,
      140.0,
      36.0,
      15.0
     ],
     "presentation": 1,
     "presentation_rect": [
      117.28394016623497,
      2.0576129853725433,
      36.0,
      15.0
     ],
     "saved_attribute_attributes": {
      "activebgcolor": {
       "expression": "themecolor.live_meter_bg"
      },
      "bordercolor": {
       "expression": "themecolor.live_meter_bg"
      },
      "focusbordercolor": {
       "expression": "themecolor.live_control_selection"
      },
      "textcolor": {
       "expression": "themecolor.live_control_selection"
      },
      "valueof": {
       "parameter_initial": [
        0
       ],
       "parameter_initial_enable": 1,
       "parameter_longname": "rmin",
       "parameter_mmax": 100.0,
       "parameter_modmode": 0,
       "parameter_shortname": "Min",
       "parameter_speedlim": 0.0,
       "parameter_type": 1,
       "parameter_unitstyle": 5
      }
     },
     "textcolor": [
      1.0,
      0.6784313725490196,
      0.33725490196078434,
      1.0
     ],
     "varname": "rmin"
    }
   },
   {
    "box": {
     "id": "pset_min",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      220.0,
      100.0,
      65.0,
      20.0
     ],
     "text": "prepend set"
    }
   },
   {
    "box": {
     "activebgcolor": [
      0.0784313725490196,
      0.058823529411764705,
      0.047058823529411764,
      1.0
     ],
     "bordercolor": [
      0.0784313725490196,
      0.058823529411764705,
      0.047058823529411764,
      1.0
     ],
     "focusbordercolor": [
      1.0,
      0.6784313725490196,
      0.33725490196078434,
      1.0
     ],
     "id": "nbox_max",
     "maxclass": "live.numbox",
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      "float"
     ],
     "parameter_enable": 1,
     "patching_rect": [
      280.0,
      140.0,
      36.0,
      15.0
     ],
     "presentation": 1,
     "presentation_rect": [
      154.0,
      2.0,
      36.0,
      15.0
     ],
     "saved_attribute_attributes": {
      "activebgcolor": {
       "expression": "themecolor.live_meter_bg"
      },
      "bordercolor": {
       "expression": "themecolor.live_meter_bg"
      },
      "focusbordercolor": {
       "expression": "themecolor.live_control_selection"
      },
      "textcolor": {
       "expression": "themecolor.live_control_selection"
      },
      "valueof": {
       "parameter_initial": [
        100
       ],
       "parameter_initial_enable": 1,
       "parameter_longname": "rmax",
       "parameter_mmax": 100.0,
       "parameter_modmode": 0,
       "parameter_shortname": "Max",
       "parameter_speedlim": 0.0,
       "parameter_type": 1,
       "parameter_unitstyle": 5
      }
     },
     "textcolor": [
      1.0,
      0.6784313725490196,
      0.33725490196078434,
      1.0
     ],
     "varname": "rmax"
    }
   },
   {
    "box": {
     "id": "pset_max",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      280.0,
      100.0,
      65.0,
      20.0
     ],
     "text": "prepend set"
    }
   },
   {
    "box": {
     "id": "sel_map",
     "maxclass": "newobj",
     "numinlets": 3,
     "numoutlets": 3,
     "outlettype": [
      "bang",
      "bang",
      ""
     ],
     "patching_rect": [
      340.0,
      80.0,
      50.0,
      20.0
     ],
     "text": "sel 0 1"
    }
   },
   {
    "box": {
     "id": "msg_hide",
     "maxclass": "message",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      400.0,
      130.0,
      55.0,
      20.0
     ],
     "text": "hidden 1"
    }
   },
   {
    "box": {
     "id": "msg_show",
     "maxclass": "message",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      340.0,
      130.0,
      55.0,
      20.0
     ],
     "text": "hidden 0"
    }
   },
   {
    "box": {
     "comment": "paramArm 0/1",
     "id": "in_paramarm",
     "index": 0,
     "maxclass": "inlet",
     "numinlets": 0,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      320.0,
      20.0,
      25.0,
      25.0
     ]
    }
   },
   {
    "box": {
     "id": "sel_pa",
     "maxclass": "newobj",
     "numinlets": 3,
     "numoutlets": 3,
     "outlettype": [
      "bang",
      "bang",
      ""
     ],
     "patching_rect": [
      320.0,
      70.0,
      50.0,
      20.0
     ],
     "text": "sel 1 0"
    }
   },
   {
    "box": {
     "id": "metro_pa",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      "bang"
     ],
     "patching_rect": [
      320.0,
      110.0,
      65.0,
      20.0
     ],
     "text": "metro 200"
    }
   },
   {
    "box": {
     "id": "msg_stop_pa",
     "maxclass": "message",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      390.0,
      110.0,
      32.0,
      20.0
     ],
     "text": "stop"
    }
   },
   {
    "box": {
     "id": "toggle_pa",
     "maxclass": "toggle",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      "int"
     ],
     "parameter_enable": 0,
     "patching_rect": [
      320.0,
      145.0,
      20.0,
      20.0
     ]
    }
   },
   {
    "box": {
     "id": "int_mapped",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      "int"
     ],
     "patching_rect": [
      200.0,
      60.0,
      30.0,
      22.0
     ],
     "text": "int"
    }
   },
   {
    "box": {
     "id": "msg_pr_hollow",
     "maxclass": "message",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      280.0,
      200.0,
      200.0,
      22.0
     ],
     "text": "bgcolor 1. 0.709804 0.196078 0."
    }
   },
   {
    "box": {
     "id": "msg_pr_filled",
     "maxclass": "message",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      280.0,
      230.0,
      200.0,
      22.0
     ],
     "text": "bgcolor 1. 0.709804 0.196078 1."
    }
   },
   {
    "box": {
     "id": "tb_restore",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      "bang"
     ],
     "patching_rect": [
      320.0,
      95.0,
      30.0,
      22.0
     ],
     "text": "t b"
    }
   },
   {
    "box": {
     "id": "tb_blink_pa",
     "maxclass": "newobj",
     "text": "t b i",
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "bang",
      ""
     ],
     "patching_rect": [
      420.0,
      145.0,
      29.5,
      20.0
     ]
    }
   },
   {
    "box": {
     "id": "msg_lcd_fg",
     "maxclass": "message",
     "text": "lcd_control_fg",
     "numinlets": 2,
     "numoutlets": 1,
     "patching_rect": [
      420.0,
      185.0,
      85.0,
      20.0
     ]
    }
   },
   {
    "box": {
     "id": "lcol_pa",
     "maxclass": "newobj",
     "text": "live.colors",
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      ""
     ],
     "patching_rect": [
      420.0,
      220.0,
      60.0,
      20.0
     ]
    }
   },
   {
    "box": {
     "id": "route_lcd_pa",
     "maxclass": "newobj",
     "text": "route lcd_control_fg",
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      ""
     ],
     "patching_rect": [
      420.0,
      255.0,
      115.0,
      20.0
     ]
    }
   },
   {
    "box": {
     "id": "plus1_pa",
     "maxclass": "newobj",
     "text": "+ 1",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      540.0,
      185.0,
      29.5,
      20.0
     ]
    }
   },
   {
    "box": {
     "id": "gate_pa",
     "maxclass": "newobj",
     "text": "gate 2",
     "numinlets": 2,
     "numoutlets": 2,
     "outlettype": [
      "",
      ""
     ],
     "patching_rect": [
      460.0,
      295.0,
      45.0,
      20.0
     ]
    }
   },
   {
    "box": {
     "id": "msg_dim",
     "maxclass": "message",
     "text": "lcdcolor $1 $2 $3 0.5",
     "numinlets": 2,
     "numoutlets": 1,
     "patching_rect": [
      420.0,
      335.0,
      120.0,
      20.0
     ]
    }
   },
   {
    "box": {
     "id": "msg_bright",
     "maxclass": "message",
     "text": "lcdcolor $1 $2 $3 1.",
     "numinlets": 2,
     "numoutlets": 1,
     "patching_rect": [
      550.0,
      335.0,
      105.0,
      20.0
     ]
    }
   },
   {
    "box": {
     "id": "msg_lcdcol_rest",
     "maxclass": "message",
     "text": "lcd_control_fg",
     "numinlets": 2,
     "numoutlets": 1,
     "patching_rect": [
      600.0,
      110.0,
      85.0,
      20.0
     ]
    }
   },
   {
    "box": {
     "id": "lcol_rest_pa",
     "maxclass": "newobj",
     "text": "live.colors",
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      ""
     ],
     "patching_rect": [
      600.0,
      145.0,
      60.0,
      20.0
     ]
    }
   },
   {
    "box": {
     "id": "route_rest_pa",
     "maxclass": "newobj",
     "text": "route lcd_control_fg",
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      ""
     ],
     "patching_rect": [
      600.0,
      185.0,
      115.0,
      20.0
     ]
    }
   },
   {
    "box": {
     "id": "msg_lcdrest",
     "maxclass": "message",
     "text": "lcdcolor $1 $2 $3 1.",
     "numinlets": 2,
     "numoutlets": 1,
     "patching_rect": [
      600.0,
      220.0,
      105.0,
      20.0
     ]
    }
   },
   {
    "box": {
     "id": "msg_reset_toggle_pa",
     "maxclass": "message",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      460.0,
      110.0,
      32.0,
      22.0
     ],
     "text": "0"
    }
   },
   {
    "box": {
     "id": "msg_inactive_pa",
     "maxclass": "message",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      700.0,
      220.0,
      180.0,
      20.0
     ],
     "text": "inactivelcdcolor $1 $2 $3 1."
    }
   }
  ],
  "lines": [
   {
    "patchline": {
     "destination": [
      "setText1",
      0
     ],
     "source": [
      "in_label",
      0
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "pset_max",
      0
     ],
     "source": [
      "in_max",
      0
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "pset_min",
      0
     ],
     "source": [
      "in_min",
      0
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "sel_pa",
      0
     ],
     "source": [
      "in_paramarm",
      0
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "pset_pct",
      0
     ],
     "source": [
      "in_pct",
      0
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "toggle_pa",
      0
     ],
     "source": [
      "metro_pa",
      0
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "obj-28",
      0
     ],
     "source": [
      "msg_hide",
      0
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "obj-28",
      0
     ],
     "source": [
      "msg_show",
      0
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "metro_pa",
      0
     ],
     "source": [
      "msg_stop_pa",
      0
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "out_max",
      0
     ],
     "source": [
      "nbox_max",
      0
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "out_min",
      0
     ],
     "source": [
      "nbox_min",
      0
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "out_map",
      0
     ],
     "source": [
      "obj-14",
      0
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "out_clear",
      0
     ],
     "source": [
      "obj-28",
      0
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "nbox_max",
      0
     ],
     "source": [
      "pset_max",
      0
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "nbox_min",
      0
     ],
     "source": [
      "pset_min",
      0
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "msg_hide",
      0
     ],
     "source": [
      "sel_map",
      0
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "msg_show",
      0
     ],
     "source": [
      "sel_map",
      1
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "metro_pa",
      0
     ],
     "source": [
      "sel_pa",
      0
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "msg_stop_pa",
      0
     ],
     "order": 1,
     "source": [
      "sel_pa",
      1
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "obj-14",
      0
     ],
     "source": [
      "setText1",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "in_mapped",
      0
     ],
     "destination": [
      "int_mapped",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "int_mapped",
      0
     ],
     "destination": [
      "sel_map",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "sel_map",
      0
     ],
     "destination": [
      "msg_pr_hollow",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "sel_map",
      1
     ],
     "destination": [
      "msg_pr_filled",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "msg_pr_hollow",
      0
     ],
     "destination": [
      "obj-14",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "msg_pr_filled",
      0
     ],
     "destination": [
      "obj-14",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "sel_pa",
      1
     ],
     "destination": [
      "tb_restore",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "tb_restore",
      0
     ],
     "destination": [
      "int_mapped",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "toggle_pa",
      0
     ],
     "destination": [
      "tb_blink_pa",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "tb_blink_pa",
      0
     ],
     "destination": [
      "msg_lcd_fg",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "tb_blink_pa",
      1
     ],
     "destination": [
      "plus1_pa",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "msg_lcd_fg",
      0
     ],
     "destination": [
      "lcol_pa",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "lcol_pa",
      0
     ],
     "destination": [
      "route_lcd_pa",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "route_lcd_pa",
      0
     ],
     "destination": [
      "gate_pa",
      1
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "plus1_pa",
      0
     ],
     "destination": [
      "gate_pa",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "gate_pa",
      0
     ],
     "destination": [
      "msg_dim",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "gate_pa",
      1
     ],
     "destination": [
      "msg_bright",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "msg_dim",
      0
     ],
     "destination": [
      "obj-14",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "msg_bright",
      0
     ],
     "destination": [
      "obj-14",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "sel_pa",
      1
     ],
     "destination": [
      "msg_lcdcol_rest",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "msg_lcdcol_rest",
      0
     ],
     "destination": [
      "lcol_rest_pa",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "lcol_rest_pa",
      0
     ],
     "destination": [
      "route_rest_pa",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "route_rest_pa",
      0
     ],
     "destination": [
      "msg_lcdrest",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "msg_lcdrest",
      0
     ],
     "destination": [
      "obj-14",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "sel_pa",
      1
     ],
     "destination": [
      "msg_reset_toggle_pa",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "msg_reset_toggle_pa",
      0
     ],
     "destination": [
      "toggle_pa",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "route_rest_pa",
      0
     ],
     "destination": [
      "msg_inactive_pa",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "msg_inactive_pa",
      0
     ],
     "destination": [
      "obj-14",
      0
     ]
    }
   }
  ],
  "parameters": {
   "nbox_max": [
    "rmax",
    "Max",
    0
   ],
   "nbox_min": [
    "rmin",
    "Min",
    0
   ],
   "obj-14": [
    "Map[11]",
    "Map",
    0
   ],
   "obj-28": [
    "Unmap[11]",
    "Unmap",
    0
   ],
   "parameterbanks": {
    "0": {
     "index": 0,
     "name": "",
     "parameters": [
      "-",
      "-",
      "-",
      "-",
      "-",
      "-",
      "-",
      "-"
     ],
     "buttons": [
      "-",
      "-",
      "-",
      "-",
      "-",
      "-",
      "-",
      "-"
     ]
    }
   },
   "inherited_shortname": 1
  },
  "autosave": 0,
  "oscreceiveudpport": 0
 }
}