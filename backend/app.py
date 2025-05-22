import os
import uuid
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sympy as sp
from sympy.parsing.sympy_parser import parse_expr
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

app = Flask(__name__)
CORS(app)

STATIC_FOLDER = os.path.join(os.getcwd(), 'static')
os.makedirs(STATIC_FOLDER, exist_ok=True)
app.config['STATIC_FOLDER'] = STATIC_FOLDER

def salvar_grafico():
    filename = f"grafico_{uuid.uuid4().hex}.png"
    filepath = os.path.join(app.config['STATIC_FOLDER'], filename)
    plt.savefig(filepath)
    plt.close()
    return f"/static/{filename}"

# Funções permitidas no parser
COMMON_FUNCS = {
    'sin': sp.sin, 'cos': sp.cos, 'tan': sp.tan,
    'asin': sp.asin, 'acos': sp.acos, 'atan': sp.atan,
    'sqrt': sp.sqrt, 'Abs': sp.Abs,
    'pi': sp.pi, 'E': sp.E,
    'exp': sp.exp, 'log': sp.log,
    'ln': sp.log,          
    'cot': sp.cot, 'csc': sp.csc, 'sec': sp.sec,
    'acot': sp.acot, 'acsc': sp.acsc, 'asec': sp.asec,
    'sinh': sp.sinh, 'cosh': sp.cosh, 'tanh': sp.tanh,
    'csch': sp.csch, 'sech': sp.sech, 'coth': sp.coth,
    'asinh': sp.asinh, 'acosh': sp.acosh, 'atanh': sp.atanh,
    'acoth': sp.acoth, 'asech': sp.asech, 'acsch': sp.acsch,
    'root': sp.root,
}

@app.route('/api/derivada', methods=['POST'])
def api_derivada():
    data = request.get_json()
    funcao_str = data.get('funcao')
    ponto_str  = data.get('ponto')

    try:
        x = sp.Symbol('x', real=True)
        ponto = float(ponto_str)
        # Parse da função com as funções comuns
        funcao   = parse_expr(funcao_str, local_dict={'x': x, **COMMON_FUNCS})
        derivada = sp.diff(funcao, x)
        valor_f  = funcao.subs(x, ponto)
        valor_d  = derivada.subs(x, ponto)
        reta_t   = valor_f + valor_d*(x - ponto)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

    # Gera gráfico
    try:
        f_num = sp.lambdify(x, funcao, 'numpy')
        t_num = sp.lambdify(x, reta_t, 'numpy')
        xs = np.linspace(ponto - 10, ponto + 10, 400)
        ys = f_num(xs)
        yt = t_num(xs)
        plt.figure(figsize=(8,5))
        plt.plot(xs, ys, label='Função')
        plt.plot(xs, yt, '--', label='Reta Tangente')
        plt.scatter([ponto], [float(valor_f)], color='red', zorder=5, label='Ponto de Tangência')
        plt.title("Função e Reta Tangente")
        plt.xlabel("x"); plt.ylabel("y")
        plt.legend(); plt.grid(True)
        url = salvar_grafico()
    except:
        url = None

    return jsonify({
        'funcao': str(funcao),
        'derivada': str(derivada),
        'valor_funcao': str(valor_f),
        'valor_derivada': str(valor_d),
        'reta_tangente': str(reta_t),
        'ponto': ponto,
        'grafico_url': url
    })

@app.route('/api/integral', methods=['POST'])
def api_integral():
    data = request.get_json()
    funcao_str   = data.get('funcao')
    lim_inf_str  = data.get('limiteInferior')
    lim_sup_str  = data.get('limiteSuperior')

    try:
        x = sp.Symbol('x', real=True)
        # Parse dos limites e da função
        lim_inf   = parse_expr(lim_inf_str, local_dict={'x': x, **COMMON_FUNCS})
        lim_sup   = parse_expr(lim_sup_str, local_dict={'x': x, **COMMON_FUNCS})
        funcao    = parse_expr(funcao_str, local_dict={'x': x, **COMMON_FUNCS})

        # Antiderivada
        primitiva  = sp.integrate(funcao, x)
        # Integral definida exata
        area_exact = sp.integrate(funcao, (x, lim_inf, lim_sup))
        # Aproximação numérica
        area_approx= float(sp.N(area_exact))

    except Exception as e:
        return jsonify({'error': str(e)}), 400

    try:
        a_num = float(sp.N(lim_inf))
        b_num = float(sp.N(lim_sup))
        f_num = sp.lambdify(x, funcao, 'numpy')
        xs = np.linspace(min(a_num,b_num)-1, max(a_num,b_num)+1, 400)
        ys = f_num(xs)
        plt.figure(figsize=(8,5))
        plt.plot(xs, ys, label='Função')
        plt.fill_between(xs, ys, where=(xs>=a_num)&(xs<=b_num),
                         alpha=0.4, label='Área sob a curva')
        plt.title("Função e Área Sob a Curva")
        plt.xlabel("x"); plt.ylabel("y")
        plt.legend(); plt.grid(True)
        url = salvar_grafico()
    except:
        url = None

    return jsonify({
        'funcao': str(funcao),
        'primitiva': str(primitiva),
        'area_exact': str(area_exact),
        'area_approx': area_approx,
        'limite_inferior': str(lim_inf),
        'limite_superior': str(lim_sup),
        'grafico_url': url
    })

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.config['STATIC_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True)
