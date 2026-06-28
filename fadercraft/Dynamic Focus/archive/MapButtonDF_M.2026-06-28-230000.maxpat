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
   134.0,
   177.0,
   900.0,
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
     "appearance": 2,
     "id": "btn_pr",
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
      20.0,
      140.0,
      118.0,
      18.0
     ],
     "presentation": 1,
     "presentation_rect": [
      0.0,
      0.0,
      118.0,
      18.0
     ],
     "saved_attribute_attributes": {
      "valueof": {
       "parameter_enum": [
        "val1",
        "val2"
       ],
       "parameter_longname": "mpr",
       "parameter_mmax": 1,
       "parameter_modmode": 0,
       "parameter_shortname": "mpr",
       "parameter_type": 2
      },
      "lcdcolor": {
       "expression": "themecolor.live_control_selection"
      }
     },
     "text": "Map Param",
     "texton": "Map Param",
     "varname": "mpr",
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
     "inactivelcdcolor": [
      0.098039215686275,
      0.098039215686275,
      0.098039215686275,
      1.0
     ],
     "lcdcolor": [
      1.0,
      0.6784313725490196,
      0.33725490196078434,
      1.0
     ],
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
     ]
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
      130.0,
      2.0,
      36.0,
      15.0
     ],
     "saved_attribute_attributes": {
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
      170.0,
      2.0,
      36.0,
      15.0
     ],
     "saved_attribute_attributes": {
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
     "appearance": 2,
     "hidden": 1,
     "id": "btn_x",
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
      340.0,
      140.0,
      18.0,
      15.0
     ],
     "presentation": 1,
     "presentation_rect": [
      210.0,
      2.0,
      18.0,
      15.0
     ],
     "saved_attribute_attributes": {
      "valueof": {
       "parameter_enum": [
        "val1",
        "val2"
       ],
       "parameter_longname": "xcl",
       "parameter_mmax": 1,
       "parameter_modmode": 0,
       "parameter_shortname": "xcl",
       "parameter_type": 2
      }
     },
     "text": "×",
     "texton": "×",
     "varname": "xcl"
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
     "id": "in_paramarm",
     "maxclass": "inlet",
     "index": 0,
     "comment": "paramArm 0/1",
     "patching_rect": [
      320.0,
      20.0,
      25.0,
      25.0
     ],
     "numinlets": 0,
     "numoutlets": 1,
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "sel_pa",
     "maxclass": "newobj",
     "text": "sel 1 0",
     "patching_rect": [
      320.0,
      70.0,
      50.0,
      20.0
     ],
     "numinlets": 1,
     "numoutlets": 3
    }
   },
   {
    "box": {
     "id": "metro_pa",
     "maxclass": "newobj",
     "text": "metro 200",
     "patching_rect": [
      320.0,
      110.0,
      65.0,
      20.0
     ],
     "numinlets": 2,
     "numoutlets": 1
    }
   },
   {
    "box": {
     "id": "msg_stop_pa",
     "maxclass": "message",
     "text": "stop",
     "patching_rect": [
      390.0,
      110.0,
      32.0,
      20.0
     ],
     "numinlets": 2,
     "numoutlets": 1
    }
   },
   {
    "box": {
     "id": "toggle_pa",
     "maxclass": "toggle",
     "patching_rect": [
      320.0,
      145.0,
      20.0,
      20.0
     ],
     "numinlets": 1,
     "numoutlets": 1
    }
   },
   {
    "box": {
     "id": "msg_fg_pa",
     "maxclass": "message",
     "text": "lcd_control_fg",
     "patching_rect": [
      420.0,
      110.0,
      90.0,
      20.0
     ],
     "numinlets": 2,
     "numoutlets": 1
    }
   },
   {
    "box": {
     "id": "msg_bg_pa",
     "maxclass": "message",
     "text": "lcd_bg",
     "patching_rect": [
      420.0,
      145.0,
      50.0,
      20.0
     ],
     "numinlets": 2,
     "numoutlets": 1
    }
   },
   {
    "box": {
     "id": "lcol_fg_pa",
     "maxclass": "newobj",
     "text": "live.colors",
     "patching_rect": [
      420.0,
      185.0,
      70.0,
      20.0
     ],
     "numinlets": 1,
     "numoutlets": 2
    }
   },
   {
    "box": {
     "id": "lcol_bg_pa",
     "maxclass": "newobj",
     "text": "live.colors",
     "patching_rect": [
      520.0,
      185.0,
      70.0,
      20.0
     ],
     "numinlets": 1,
     "numoutlets": 2
    }
   },
   {
    "box": {
     "id": "route_fg_pa",
     "maxclass": "newobj",
     "text": "route lcd_control_fg",
     "patching_rect": [
      420.0,
      225.0,
      115.0,
      20.0
     ],
     "numinlets": 1,
     "numoutlets": 2
    }
   },
   {
    "box": {
     "id": "route_bg_pa",
     "maxclass": "newobj",
     "text": "route lcd_bg",
     "patching_rect": [
      550.0,
      225.0,
      85.0,
      20.0
     ],
     "numinlets": 1,
     "numoutlets": 2
    }
   },
   {
    "box": {
     "id": "msg_tcol_pa",
     "maxclass": "message",
     "text": "textcolor $1 $2 $3 $4",
     "patching_rect": [
      420.0,
      265.0,
      130.0,
      20.0
     ],
     "numinlets": 2,
     "numoutlets": 1
    }
   },
   {
    "box": {
     "id": "msg_bcol_pa",
     "maxclass": "message",
     "text": "bgcolor $1 $2 $3 $4",
     "patching_rect": [
      550.0,
      265.0,
      140.0,
      20.0
     ],
     "numinlets": 2,
     "numoutlets": 1
    }
   },
   {
    "box": {
     "id": "sel_tog_pa",
     "maxclass": "newobj",
     "text": "sel 1 0",
     "patching_rect": [
      320.0,
      185.0,
      50.0,
      20.0
     ],
     "numinlets": 1,
     "numoutlets": 3
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
      340.0,
      165.0,
      165.0,
      20.0
     ],
     "presentation": 1,
     "presentation_rect": [
      340.0,
      165.0,
      165.0,
      20.0
     ],
     "text": "bgcolor 1. 0.709804 0.196078 1."
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
      340.0,
      195.0,
      165.0,
      20.0
     ],
     "presentation": 1,
     "presentation_rect": [
      340.0,
      195.0,
      165.0,
      20.0
     ],
     "text": "bgcolor 1. 0.709804 0.196078 0."
    }
   },
   {
    "box": {
     "comment": "Add offset (0..1)",
     "id": "in_add",
     "index": 6,
     "maxclass": "inlet",
     "numinlets": 0,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      380.0,
      20.0,
      25.0,
      25.0
     ],
     "presentation": 1,
     "presentation_rect": [
      380.0,
      20.0,
      25.0,
      25.0
     ]
    }
   },
   {
    "box": {
     "comment": "Mult scale (1=normal)",
     "id": "in_mult",
     "index": 7,
     "maxclass": "inlet",
     "numinlets": 0,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      440.0,
      20.0,
      25.0,
      25.0
     ],
     "presentation": 1,
     "presentation_rect": [
      440.0,
      20.0,
      25.0,
      25.0
     ]
    }
   },
   {
    "box": {
     "id": "fnum_add",
     "maxclass": "flonum",
     "format": 6,
     "fontname": "Arial Bold",
     "fontsize": 10.0,
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      "bang"
     ],
     "parameter_enable": 0,
     "patching_rect": [
      380.0,
      100.0,
      46.0,
      20.0
     ],
     "presentation": 1,
     "presentation_rect": [
      210.0,
      2.0,
      40.0,
      15.0
     ],
     "prototypename": "Live",
     "triscale": 0.75
    }
   },
   {
    "box": {
     "id": "fnum_mult",
     "maxclass": "flonum",
     "format": 6,
     "fontname": "Arial Bold",
     "fontsize": 10.0,
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      "bang"
     ],
     "parameter_enable": 0,
     "patching_rect": [
      440.0,
      100.0,
      46.0,
      20.0
     ],
     "presentation": 1,
     "presentation_rect": [
      255.0,
      2.0,
      40.0,
      15.0
     ],
     "prototypename": "Live",
     "triscale": 0.75
    }
   },
   {
    "box": {
     "id": "pset_add",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      380.0,
      60.0,
      65.0,
      20.0
     ],
     "presentation": 1,
     "presentation_rect": [
      380.0,
      60.0,
      65.0,
      20.0
     ],
     "text": "prepend set"
    }
   },
   {
    "box": {
     "id": "pset_mult",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      440.0,
      60.0,
      65.0,
      20.0
     ],
     "presentation": 1,
     "presentation_rect": [
      440.0,
      60.0,
      65.0,
      20.0
     ],
     "text": "prepend set"
    }
   },
   {
    "box": {
     "id": "cmt_add",
     "maxclass": "comment",
     "fontname": "Arial Bold",
     "fontsize": 10.0,
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      380.0,
      125.0,
      46.0,
      18.0
     ],
     "presentation": 1,
     "presentation_rect": [
      210.0,
      17.0,
      30.0,
      15.0
     ],
     "text": "Add"
    }
   },
   {
    "box": {
     "id": "cmt_mult",
     "maxclass": "comment",
     "fontname": "Arial Bold",
     "fontsize": 10.0,
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      440.0,
      125.0,
      46.0,
      18.0
     ],
     "presentation": 1,
     "presentation_rect": [
      255.0,
      17.0,
      30.0,
      15.0
     ],
     "text": "Mult"
    }
   },
   {
    "box": {
     "comment": "Add value",
     "id": "out_add",
     "index": 4,
     "maxclass": "outlet",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      380.0,
      700.0,
      25.0,
      25.0
     ],
     "presentation": 1,
     "presentation_rect": [
      380.0,
      700.0,
      25.0,
      25.0
     ]
    }
   },
   {
    "box": {
     "comment": "Mult value",
     "id": "out_mult",
     "index": 5,
     "maxclass": "outlet",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      440.0,
      700.0,
      25.0,
      25.0
     ],
     "presentation": 1,
     "presentation_rect": [
      440.0,
      700.0,
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
      "out_map",
      0
     ],
     "source": [
      "btn_pr",
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
      "btn_x",
      0
     ]
    }
   },
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
      "sel_map",
      0
     ],
     "source": [
      "in_mapped",
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
      "btn_x",
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
      "btn_x",
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
      "btn_pr",
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
      "in_paramarm",
      0
     ],
     "destination": [
      "sel_pa",
      0
     ],
     "midpoints": []
    }
   },
   {
    "patchline": {
     "source": [
      "sel_pa",
      0
     ],
     "destination": [
      "metro_pa",
      0
     ],
     "midpoints": []
    }
   },
   {
    "patchline": {
     "source": [
      "sel_pa",
      1
     ],
     "destination": [
      "msg_stop_pa",
      0
     ],
     "midpoints": []
    }
   },
   {
    "patchline": {
     "source": [
      "msg_stop_pa",
      0
     ],
     "destination": [
      "metro_pa",
      0
     ],
     "midpoints": []
    }
   },
   {
    "patchline": {
     "source": [
      "metro_pa",
      0
     ],
     "destination": [
      "toggle_pa",
      0
     ],
     "midpoints": []
    }
   },
   {
    "patchline": {
     "source": [
      "toggle_pa",
      0
     ],
     "destination": [
      "sel_tog_pa",
      0
     ],
     "midpoints": []
    }
   },
   {
    "patchline": {
     "source": [
      "sel_tog_pa",
      0
     ],
     "destination": [
      "msg_fg_pa",
      0
     ],
     "midpoints": []
    }
   },
   {
    "patchline": {
     "source": [
      "sel_tog_pa",
      1
     ],
     "destination": [
      "msg_bg_pa",
      0
     ],
     "midpoints": []
    }
   },
   {
    "patchline": {
     "source": [
      "msg_fg_pa",
      0
     ],
     "destination": [
      "lcol_fg_pa",
      0
     ],
     "midpoints": []
    }
   },
   {
    "patchline": {
     "source": [
      "msg_bg_pa",
      0
     ],
     "destination": [
      "lcol_bg_pa",
      0
     ],
     "midpoints": []
    }
   },
   {
    "patchline": {
     "source": [
      "lcol_fg_pa",
      0
     ],
     "destination": [
      "route_fg_pa",
      0
     ],
     "midpoints": []
    }
   },
   {
    "patchline": {
     "source": [
      "lcol_bg_pa",
      0
     ],
     "destination": [
      "route_bg_pa",
      0
     ],
     "midpoints": []
    }
   },
   {
    "patchline": {
     "source": [
      "route_fg_pa",
      0
     ],
     "destination": [
      "msg_tcol_pa",
      0
     ],
     "midpoints": []
    }
   },
   {
    "patchline": {
     "source": [
      "route_bg_pa",
      0
     ],
     "destination": [
      "msg_bcol_pa",
      0
     ],
     "midpoints": []
    }
   },
   {
    "patchline": {
     "source": [
      "msg_tcol_pa",
      0
     ],
     "destination": [
      "btn_pr",
      0
     ],
     "midpoints": []
    }
   },
   {
    "patchline": {
     "source": [
      "msg_bcol_pa",
      0
     ],
     "destination": [
      "btn_pr",
      0
     ],
     "midpoints": []
    }
   },
   {
    "patchline": {
     "source": [
      "sel_pa",
      1
     ],
     "destination": [
      "msg_bg_pa",
      0
     ],
     "midpoints": []
    }
   },
   {
    "patchline": {
     "source": [
      "sel_pa",
      1
     ],
     "destination": [
      "toggle_pa",
      0
     ],
     "midpoints": []
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
      "msg_pr_filled",
      0
     ],
     "destination": [
      "btn_pr",
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
      "btn_pr",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "in_add",
      0
     ],
     "destination": [
      "pset_add",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "pset_add",
      0
     ],
     "destination": [
      "fnum_add",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "fnum_add",
      0
     ],
     "destination": [
      "out_add",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "in_mult",
      0
     ],
     "destination": [
      "pset_mult",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "pset_mult",
      0
     ],
     "destination": [
      "fnum_mult",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "fnum_mult",
      0
     ],
     "destination": [
      "out_mult",
      0
     ]
    }
   }
  ],
  "parameters": {
   "btn_pr": [
    "mpr",
    "mpr",
    0
   ],
   "btn_x": [
    "xcl",
    "xcl",
    0
   ],
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