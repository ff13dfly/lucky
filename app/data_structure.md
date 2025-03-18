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

* 显示图像的尺寸`[ SIZE_X, SIZE_Y ]`,可以作为NFT的图像来源，一般为方形

### Cell

* 截取图像的最小尺寸`[ CELL_X, CELL_Y ]`,为拼接最终图像的最小单元，可以不为方形

### Grid

* 原始图像的切分结果`[ GRID_X, GRID_Y ]`,原始图像的切割逻辑

## Parts

* 使用不同的Part来拼接最终的图像，每个Part的定义如下详述。

* 根据Part里的OPTION可以控制百分比。

### Value

* 获取到取值的定义 `[ START, STEP, OPTION, OFFSET ]`,从64位的SHA256的hash里取出数字的定义

* START:

* STEP:

* OPTION:

* OFFSET:

### Image Section

* 获取图像位置的定义 `[ LINE, ROW, LINE_EXT, ROW_EXT ]`,从64位的SHA256的hash里取出数字的定义

### Position of part

* 截取出的图像，如何定位到最终的结果图像上的位置`[ POSITION_X, POSITION_Y ]`

### Rarity of parts

* 根据系列对应的取值，用于评估是否为最终结果

## Series

### Name

### Description
