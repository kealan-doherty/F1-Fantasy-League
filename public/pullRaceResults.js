import { updatePts } from "./SQL_functions.js";

export function pullDriverResults(){
    fetch("https://api.openf1.org/v1/session_result?session_key=latest&position<=10")
    .then((response) => response.json())
    .then((jsonContent) => {
        const driverResults = {}
        //update the fetched data to convert driver number to name as it's stored in the DB
        for(let i = 0; i <= 9; i++ ){
            switch(jsonContent[i].driver_number){
                case 1:
                    driverResults["Max_Verstappen"] = jsonContent[i].position;
                    continue;
                case 22:
                    driverResults["Yuki_Tsunoda"] = jsonContent[i].position;
                    continue;
                case 81:
                    driverResults["Oscar_Piastri"] = jsonContent[i].position;
                    continue;
                case 4:
                    driverResults["Lando_Norris"] = jsonContent[i].position;
                    continue;
                case 16:
                    driverResults["Charles_Lerlerc"] = jsonContent[i].position;
                    continue;
                case 44:
                    driverResults["Lewis_Hamilton"] = jsonContent[i].position;
                    continue;
                case 63:
                    driverResults["Geogre Russell"] = jsonContent[i].position;
                    continue;
                case 12:
                    driverResults["Kimi Antinelli"] = jsonContent[i].position;
                    continue;
                case 18:
                    driverResults["Lance Stroll"] = jsonContent[i].position;
                    continue;
                case 14:
                    driverResults["Fernando Alonso"] = jsonContent[i].position;
                    continue
                case 55:
                    driverResults["Carlos Sainz"] = jsonContent[i].position;
                    continue;
                case 23:
                    driverResults["Alex Albon"] = jsonContent[i].position;
                    continue;
                case 31:
                    driverResults["Esteban Ocon"] = jsonContent[i].position;
                    continue;
                case 87:
                    driverResults["Oliver_Bearman"] = jsonContent[i].position;
                    continue;
                case 27:
                    driverResults["Nico_Hulkenberg"] = jsonContent[i].position;
                    continue;
                case 5:
                    driverResults["Gabriel_Bortoleto"] = jsonContent[i].position;
                    continue;
                case 30:
                    driverResults["Liam_Lawson"] = jsonContent[i].position;
                    continue;
                case 6:
                    driverResults["Isack_Hadjar"] = jsonContent[i].position;
                    continue;
                case 10:
                    driverResults["Pierre_Gasly"] = jsonContent[i].position;
                    continue;
                case 43:
                    driverResults["Franco_Colapinto"] = jsonContent[i].position;
                    continue;
                default:
                    console.log("Driver is not currently listed");
            }       
        }
        updatePts(driverResults);
});
}

export function convertPosToPts(driverResults){
    // transform position into points scored for ease of adding them to the DB
        Object.keys(driverResults).forEach(key => {
            switch(driverResults[key]){
                case 1:
                    driverResults[key] = 25;
                    break;
                case 2:
                    driverResults[key] = 18;
                    break;
                case 3:
                    driverResults[key] = 15;
                    break;
                case 4: 
                    driverResults[key] = 12;
                    break;
                case 5:
                    driverResults[key] = 10;
                    break;
                case 6:
                    driverResults[key] = 8;
                    break;
                case 7:
                    driverResults[key] = 6;
                    break;
                case 8: 
                    driverResults[key] = 4;
                    break;
                case 9:
                    driverResults[key] = 2;
                    break;
                case 10:
                    driverResults[key] = 1;
                    break;
                default:
                    console.log('invaild position issue with fetching result data');

            }
        });
        return driverResults;
}
    

pullDriverResults();
