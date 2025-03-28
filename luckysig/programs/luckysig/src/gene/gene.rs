use serde_json::{Value};

/********************************************************************/
/************************ Public Functions **************************/
/********************************************************************/

///!important, check every detail of gene raw data
/// Even there is `enable` method to avoid invalid gene data, it is still necessary to check gene carefully
///TODO, here to check gene data carefully.
pub fn is_valid_gene(input: &str, _rate:u32 ) -> bool {
    let parsed: Value = match serde_json::from_str(input) {
        Ok(json) => json,
        Err(_) => return false,
    };

    // 1. check basic fit [[u32, u32], [u32, u32], [u32, u32]]
    if let Some(basic) = parsed.get("basic").and_then(|v| v.as_array()) {
        if basic.len() != 3 
            || !basic.iter().all(|item| item.is_array() 
            && item.as_array().unwrap().len() == 2 
            && item.as_array().unwrap().iter().all(|n| n.is_u64())) {
            return false;
        }

        //a. size check
        const SIZE_MAX:u32=1200;        //render result max size 1200
        if value_to_u32(&basic[0][0]).unwrap() <= 0 
            || value_to_u32(&basic[0][1]).unwrap() <= 0 {
            return false;
        }

        //b. grid check
        if value_to_u32(&basic[1][0]).unwrap() <= 1 
            || value_to_u32(&basic[1][1]).unwrap() <= 1 {
            return false;
        }

        //c. cell check
        const CELL_MIN:u32=30;      //min size of cell
        if value_to_u32(&basic[2][0]).unwrap() <= CELL_MIN 
            || value_to_u32(&basic[2][1]).unwrap() <= CELL_MIN 
            || value_to_u32(&basic[2][0]).unwrap() > SIZE_MAX
            || value_to_u32(&basic[2][1]).unwrap() > SIZE_MAX {
            return false;
        }

    } else {
        return false;
    }

    // 2. check parts[]
    if let Some(parts) = parsed.get("parts").and_then(|v| v.as_array()) {
        for part in parts {
            if let Some(part_arr) = part.as_array() {
                if part_arr.len() != 4 {
                    return false;
                }

                // 2.1 check value params [[u32; 4]]
                if  !part_arr[0].is_array() 
                    || part_arr[0].as_array().unwrap().len() != 4 
                    || !part_arr[0].as_array().unwrap().iter().all(|n| n.is_u64()){
                    return false;
                }

                //a. hash part params check
                let start:u32=value_to_u32(&part_arr[0][0]).unwrap();
                let step:u32=value_to_u32(&part_arr[0][1]).unwrap();
                let last=start+step;
                if start >=64 || last >=64 {
                    return false;
                }

                //b. option params check
                let options:u32=value_to_u32(&part_arr[0][2]).unwrap();
                println!("{:?}", options); 
                if options < 1 {
                    return false;
                }

                //c. offset params check
                let offset:u32=value_to_u32(&part_arr[0][3]).unwrap();
                if offset >= options {
                    return false;
                }

                // 2.2 check image params [u32; 4]
                if  !part_arr[1].is_array() 
                    || part_arr[1].as_array().unwrap().len() != 4 
                    || !part_arr[1].as_array().unwrap().iter().all(|n| n.is_u64()){
                    return false;
                }

                //a. line check && row check

                //b. ext check


                // 2.3 check position params [u32; 2]
                if !part_arr[2].is_array() 
                    || part_arr[2].as_array().unwrap().len() != 2 
                    || !part_arr[2].as_array().unwrap().iter().all(|n| n.is_u64()){
                    return false;
                }

                //a. check position limit, wether out of render result


                // 2.4 check rarity [[u32]]
                if !part_arr[3].is_array() 
                    || !part_arr[3].as_array().unwrap().iter().all(|inner| inner.is_array() 
                    && inner.as_array().unwrap().iter().all(|n| n.is_u64())) {
                    return false;
                }

                //a. check all select < options

            } else {
                return false;
            }
        }
    } else {
        return false;
    }

    // 3. check series[]
    if let Some(series) = parsed.get("series").and_then(|v| v.as_array()) {
        for s in series {
            if let Some(s_arr) = s.as_array() {
                if s_arr.len() != 2 
                    || !s_arr[0].is_string() 
                    || !s_arr[1].is_string() {
                    return false;
                }
            } else {
                return false;
            }
        }
    } else {
        return false;
    }

    // 4. check raw URI
    if !parsed.get("raw").map_or(false, |v| v.is_string()) {
        return false;
    }

    // 5. check win rate, should be the same as "rate"

    true
}


/********************************************************************/
/*********************** Private Functions **************************/
/********************************************************************/

fn value_to_u32(value: &Value) -> Option<u32> {
    value.as_u64().and_then(|v| u32::try_from(v).ok())
}

/********************************************************************/
/**************************** Test Part *****************************/
/********************************************************************/

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn check_gene_data(){
        let json_str = r#"
            {
                "basic":[[600,600],[4,5],[200,200]],
                "parts":[
                    [[2,4,8,0],[0,0,1,1],[100,120],[[2]]],
                    [[12,4,5,0],[1,2,0,0],[0,120],[[3,4]]],
                    [[22,2,5,0],[2,0,1,0],[200,120],[[0,2,3]]],
                    [[24,2,1,0],[4,0,2,2],[0,0],[[0]]]
                ],
                "series":[["NAME","DESC_OF_SERIRES"]],
                "raw":"URI_OF_IPFS"
            }
            "#;
        assert_eq!(
            true,
            is_valid_gene(json_str,100)
        );
    }

    #[test]
    fn invalild_part(){
        let json_str = r#"
            {
                "basic":[[600,600],[4,5],[200,200]],
                "parts":[
                    [[2,4,8,0],[0,0,1,1],[100,120],[[2]]],
                    [[12,4,5,0],[1,2,0,0],[0,120],[[3,4]]],
                    [[22,2,5,0],[2,0,1,0],[200,120],[[0,2,3]]],
                    [[64,2,1,0],[4,0,2,2],[0,0],[[0]]]
                ],
                "series":[["NAME","DESC_OF_SERIRES"]],
                "raw":"URI_OF_IPFS"
            }
            "#;

        assert_eq!(
            false,
            is_valid_gene(json_str,100)
        );
    }
}