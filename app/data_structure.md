# Gene Data Strcutrue

## Sample

```Javascript
    {
        basic:[
            [900,900],          //size
            [100,100]           //cell
            [8,12],             //grid
        ],
        parts:[
            [
                [4,2,5,0],      //value
                [0,1,0,0],      //image
                [122,568],      //position
                [[2]]           //rarity
            ]
        ],
        series:[
            ["BTC Tree","Win token when 8 BTC"]     //[ NAME, DESC ]
        ],
        raw:"https://bafkreicl7rl5d6bkgyzxc67jdfoythbthikk7bnt4m22zjd6e7jx5hoera.ipfs.w3s.link/",
    }
```

```Javascript
    // Part format
    [
        [4,2,5,0],      //[ START, SETP, OPTION, OFFSET ]
        [0,1,0,0],      //[ LINE, ROW, LINE_EXT, ROW_EXT ]
        [122,568],      //[ POSITION_X, POSITION_Y ]
        [[2]]           //[ SERIES[0] ], SERIES[0]=[ VALID_INDEX ]
    ]

    //Series format
    ["Tree","Win token when 8 BTC"]     //[ NAME, DESC ]
```

## Basic

### Size

* Render result size `[ SIZE_X, SIZE_Y ]`.

### Cell

* Mini size of image to cut `[ CELL_X, CELL_Y ]`

### Grid

* Orginal raw image lines and rows base on cell size `[ GRID_X, GRID_Y ]`

## Parts

* Result is combined from `parts`, the definition as follow.

### Value

* Get the selected part from hash. `[ START, STEP, OPTION, OFFSET ]`

* START:

* STEP:

* OPTION:

* OFFSET:

### Image Section

* Where to get the proper part from raw image. `[ LINE, ROW, LINE_EXT, ROW_EXT ]`

### Position of part

* Position of part to locate on result image. `[ POSITION_X, POSITION_Y ]`

### Rarity of parts

* Which part as the winner result.

## Series

### Name

### Description
