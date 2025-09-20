
    const driverNumbers = {1:"Max Verstappen",
                       22:"Yuki Tusonda",
                       81:"Oscar Piastri",
                       4:"Lando Norris",
                       16:"Charles Leclerc",
                       44:"Lewis Hamilton",
                       63:"George Russell",
                       12:"Kimi Antonelli",
                       23:"Alex Albon",
                       55:"Carlos Sainz",
                       18:"Lance Stroll",
                       14:"Fernando Alonso",
                       30:"Liam Lawson",
                       8:"Isack Hadjar",
                       27:"Nico Hulkenberg",
                       5:"Gabriel Bortoleto",
                       31:"Esteban Ocon",
                       87:"Oliver Bearman",
                       10:"Pierre Gasly",
                       43:"Franco Colapinto",
  }

  const pointsForPosition = {1:25,
                             2:18,
                             3:15,
                             4:12,
                             5:10,
                             6:8,
                             7:6,
                             8:4,
                             9:2,
                             10:1
  }

export function pullDriverResults(){
    fetch("https://api.openf1.org/v1/session_result?session_key=latest&position<=10")
    .then((response) => response.json())
    .then((jsonContent) => {
        console.log(jsonContent[5]);
        const driverResults = {}
        for(let i = 0; i <= 9; i++ ){
            switch(jsonContent[i].driver_number){
                case 1:
                    driverResults["Max Verstappen"] = jsonContent[i].position;
                    continue;
                case 22:
                    driverResults["Yuki Tsunoda"] = jsonContent[i].position;
                    continue;
                case 81:
                    driverResults["Oscar Piastri"] = jsonContent[i].position;
                    continue;
                case 4:
                    driverResults["Lando Norris"] = jsonContent[i].position;
                    continue;
                case 16:
                    driverResults["Charles Lerlerc"] = jsonContent[i].position;
                    continue;
                case 44:
                    driverResults["Lewis Hamilton"] = jsonContent[i].position;
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
                    driverResults["Oliver Bearman"] = jsonContent[i].position;
                    continue;
                case 27:
                    driverResults["Nico Hulkenberg"] = jsonContent[i].position;
                    continue;
                case 5:
                    driverResults["Gabriel Bortoleto"] = jsonContent[i].position;
                    continue;
                case 30:
                    driverResults["Liam Lawson"] = jsonContent[i].position;
                    continue;
                case 6:
                    driverResults["Isack Hadjar"] = jsonContent[i].position;
                    continue;
                case 10:
                    driverResults["Pierre Gasly"] = jsonContent[i].position;
                    continue;
                case 43:
                    driverResults["Franco Colapinto"] = jsonContent[i].position;
                    continue;
                default:
                    console.log("Driver is not currently listed");
            }       
        }

});
}
    
    
  


