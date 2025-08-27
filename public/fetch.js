export async function fetchdata(){
    try{
        const response = await fetch('http://localhost:3000/profilePage/userData');
        const data = await response.json();
        return data;
    } catch (error){
        console.error('Error fetching data:', error);
    }
}
const data = fetchdata();
console.log('hey this works!!!!', data);
