//fetch("https://api.openf1.org/v1/session_result?session_key=latest&position<=10")
    //.then((response) => response.json())
    //.then((jsonContent) => console.log(jsonContent[0].driver_number));

// Update this file will likely need a class to make creating drivers and their points scored
// per race easier to access Next Steps: create functionality so where it pulls the latest session data
// on monday morning so none of the pratice sessions get used by mistake atleast for the race
// anf figure out a way to add only q3 session for the grid position then write SQL query to update all users points based 
// on their drivers quali and finishing position.

  var driverNumbers = {1:"Max Verstappen",
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


    fetch("https://api.openf1.org/v1/session_result?session_key=latest&position<=10")
    .then((response) => response.json())
    .then((jsonContent) => {
        const DriverResults = {}
        for(let i = 0; i <= 9; i++ ){
            driverResults[jsonContent[i].driver_number] = jsonContent[i].position;
        
    }
    console.log(curDriver);
});
    
    
  


export function updateDriversPoints(driver1, driver2){
    fetch("https://api.openf1.org/v1/session_result?session_key=latest")
    .then((response) => response.json())
    .then((jsonContent) =>{ 
        console.log(jsonContent[0]);
        

    });
}