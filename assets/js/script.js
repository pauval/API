const urlAPI = 'https://mindicador.cl/api/';
const select_monedas = document.querySelector('#coins');
const resultado = document.querySelector('#resultados');
let graficoCanvas = null;

const obtenerDatosApi = async (url) => {
    try {
        const response = await fetch(url);
        const coins = await response.json();
        select_monedas.innerHTML = `<option value="" disabled selected>--Seleccione una moneda--</option>`;
        Object.entries(coins).forEach(([coinKey, coin]) => {
            if (coin.unidad_medida === 'Pesos') {
                select_monedas.innerHTML += `<option value="${coinKey}">${coin.nombre}</option>`;
            }
        });
    } catch (error) {
        console.error('Error al obtener datos de la API:', error);
    }
}

const obtenerDatoMoneda = async (nombre_moneda) => {
    try {
        const response = await fetch(`${urlAPI}${nombre_moneda}`);
        const coin = await response.json();
        return coin.serie.slice(0, 10);
    } catch (error) {
        console.error('Error al obtener datos de la moneda:', error);
    }
}

const obtenerPrecioMoneda = async (nombre_moneda) => {
    try {
        const response = await fetch(`${urlAPI}${nombre_moneda}`);
        const coin = await response.json();
        return coin.serie[0].valor;
    } catch (error) {
        console.error('Error al obtener precio de la moneda:', error);
    }
}

const calcular = async () => {
    try {
        const clp = document.querySelector('#clp').value;
        const nombre_moneda = select_monedas.value;
        const valor_moneda = await obtenerPrecioMoneda(nombre_moneda);
        const calculo = (clp / valor_moneda).toFixed(2);
        resultado.innerHTML = `<label>Resultado: ${calculo}</label>`;
    } catch (error) {
        console.error('Error al calcular:', error);
    }
}

const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const obtenerGrafico = async (nombre_moneda) => {
    try {
        if (graficoCanvas) {
            graficoCanvas.destroy();
        }
        
        const coin_dates = await obtenerDatoMoneda(nombre_moneda);
        const formattedCoinDates = coin_dates.map(coin_date => ({
            fecha: formatearFecha(coin_date.fecha),
            valor: coin_date.valor
        }));
        const orderedCoinDates = formattedCoinDates.sort((a, b) => new Date(a.fecha) - new Date(b.fecha)); 
        const labels = orderedCoinDates.map(coin_date => coin_date.fecha);
        const data = orderedCoinDates.map(coin_date => coin_date.valor);
        const datasets = [{
            label: "Historial últimos 10 días",
            borderColor: "rgb(255, 99, 132)",
            data
        }];
        const data_render = { labels, datasets };
        
        const ctx = document.getElementById("canvas_grafico").getContext('2d');
        graficoCanvas = new Chart(ctx, {
            type: "line",
            data: data_render
        });
    } catch (error) {
        console.error('Error al obtener el gráfico:', error);
    }
}

select_monedas.addEventListener('change', async (event) => {
    const coin = event.target.value;
    await obtenerGrafico(coin);
});

document.querySelector('#calcular').addEventListener('click', calcular);

obtenerDatosApi(urlAPI);
