import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  TextField,
  CircularProgress,
  Box,
  Snackbar,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText
} from '@mui/material';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in:      { opacity: 1, y: 0 },
  out:     { opacity: 0, y: -20 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5
};

function HomePage({ setPage }) {
  return (
    <motion.div initial="initial" animate="in" exit="out"
                variants={pageVariants} transition={pageTransition}>
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          Cálculo II
        </Typography>
        <Typography variant="h6" gutterBottom>
          Escolha uma das opções abaixo:
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
          <Button variant="contained" onClick={() => setPage('derivadas')}>
            Derivadas
          </Button>
          <Button variant="contained" onClick={() => setPage('integrais')}>
            Integrais
          </Button>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
          <Button variant="outlined" onClick={() => setPage('historiaDerivadas')}>
            História de Derivadas
          </Button>
          <Button variant="outlined" onClick={() => setPage('historiaIntegrais')}>
            História de Integrais
          </Button>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button variant="outlined" onClick={() => setPage('instrucoes')}>
            Manual de Instruções
          </Button>
        </Box>
      </Container>
    </motion.div>
  );
}

function DerivadasPage({ setPage }) {
  const [funcao, setFuncao] = useState('');
  const [ponto, setPonto] = useState('');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!funcao.trim() || !ponto.trim()) {
      setSnackbar({ open: true, message: 'Preencha a função e o ponto.', severity: 'error' });
      return;
    }
    if (funcao.includes('^')) {
      setSnackbar({ open: true, message: 'Erro: Use notação Python (x**2 em vez de x^2).', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/derivada', {
        funcao: funcao.trim(),
        ponto: ponto.trim()
      });
      setResultado(response.data);
      setSnackbar({ open: true, message: 'Derivada calculada com sucesso!', severity: 'success' });
    } catch (error) {
      const msg = error.response?.data?.error || 'Erro ao calcular derivada.';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
    setLoading(false);
  };

  const handleVoltar = () => {
    setPage('home');
    setResultado(null);
  };

  return (
    <motion.div initial="initial" animate="in" exit="out"
                variants={pageVariants} transition={pageTransition}>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Calculadora de Derivadas</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Função (ex: x**2 + 3*x + 1)"
            variant="outlined"
            fullWidth
            margin="normal"
            value={funcao}
            onChange={(e) => setFuncao(e.target.value)}
          />
          <TextField
            label="Ponto (ex: 2)"
            variant="outlined"
            fullWidth
            margin="normal"
            value={ponto}
            onChange={(e) => setPonto(e.target.value)}
          />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Calcular Derivada'}
            </Button>
          </Box>
        </form>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button variant="outlined" onClick={handleVoltar}>
            Voltar ao Menu
          </Button>
        </Box>
        {resultado && (
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Resultado</Typography>
              <Typography><strong>Função:</strong> {resultado.funcao}</Typography>
              <Typography><strong>Derivada:</strong> {resultado.derivada}</Typography>
              <Typography><strong>f({resultado.ponto}):</strong> {resultado.valor_funcao}</Typography>
              <Typography><strong>f'({resultado.ponto}):</strong> {resultado.valor_derivada}</Typography>
              <Typography><strong>Reta Tangente:</strong> {resultado.reta_tangente}</Typography>
              {resultado.grafico_url && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">Gráfico</Typography>
                  <img
                    src={`http://127.0.0.1:5000${resultado.grafico_url}`}
                    alt="Gráfico"
                    style={{ maxWidth: '100%' }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        )}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </motion.div>
  );
}

function IntegraisPage({ setPage }) {
  const [funcao, setFuncao] = useState('');
  const [limiteInferior, setLimiteInferior] = useState('');
  const [limiteSuperior, setLimiteSuperior] = useState('');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!funcao || !limiteInferior || !limiteSuperior) {
      setSnackbar({ open: true, message: 'Preencha todos os campos.', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/integral', {
        funcao: funcao.trim(),
        limiteInferior: limiteInferior.trim(),
        limiteSuperior: limiteSuperior.trim()
      });
      setResultado(response.data);
      setSnackbar({ open: true, message: 'Integral calculada com sucesso!', severity: 'success' });
    } catch (error) {
      const msg = error.response?.data?.error || 'Erro ao calcular integral.';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
    setLoading(false);
  };

  const handleVoltar = () => {
    setPage('home');
    setResultado(null);
  };

  return (
    <motion.div initial="initial" animate="in" exit="out"
                variants={pageVariants} transition={pageTransition}>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Calculadora de Integrais</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Função (ex: x**2)"
            variant="outlined"
            fullWidth
            margin="normal"
            value={funcao}
            onChange={(e) => setFuncao(e.target.value)}
          />
          <TextField
            label="Limite Inferior (ex: 0)"
            variant="outlined"
            fullWidth
            margin="normal"
            value={limiteInferior}
            onChange={(e) => setLimiteInferior(e.target.value)}
          />
          <TextField
            label="Limite Superior (ex: 5)"
            variant="outlined"
            fullWidth
            margin="normal"
            value={limiteSuperior}
            onChange={(e) => setLimiteSuperior(e.target.value)}
          />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Calcular Integral'}
            </Button>
          </Box>
        </form>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button variant="outlined" onClick={handleVoltar}>
            Voltar ao Menu
          </Button>
        </Box>

        {resultado && (
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Resultado</Typography>

              <Typography>
                <strong>Integral definida:</strong> {' '}
                ∫<sup>{resultado.limite_superior}</sup>
                <sub>{resultado.limite_inferior}</sub> {resultado.funcao} dx
              </Typography>

              <Typography>
                <strong>Primitiva (antiderivada):</strong> {resultado.primitiva}
              </Typography>

              <Typography>
                <strong>Valor exato da integral:</strong> {resultado.area_exact}
              </Typography>

              <Typography>
                <strong>Valor aproximado:</strong> {resultado.area_approx.toFixed(7)}
              </Typography>

              {resultado.grafico_url && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">Gráfico</Typography>
                  <img
                    src={`http://127.0.0.1:5000${resultado.grafico_url}`}
                    alt="Gráfico"
                    style={{ maxWidth: '100%' }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </motion.div>
  );
}

function HistoriaDerivadas({ setPage }) {
  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          História de Derivadas
        </Typography>
        <Typography variant="body1" paragraph>
          O conceito de função que hoje pode parecer simples, é o resultado de uma longa evolução histórica iniciada na Antiguidade, quando matemáticos babilônios utilizavam tabelas de quadrados e raízes quadradas e cúbicas, e os pitagóricos buscavam relacionar a altura do som emitido por cordas à tensão e ao comprimento. Naquela época, as relações entre variáveis eram descritas de forma implícita.
        </Typography>
        <Typography variant="body1" paragraph>
          No séc. XVII, com a introdução das coordenadas cartesianas por Descartes e Fermat, tornou-se possível transformar problemas geométricos em problemas algébricos, possibilitando o estudo analítico de funções. Esse avanço impulsionou a criação de novas curvas e o desenvolvimento do cálculo diferencial.
        </Typography>
        <Typography variant="body1" paragraph>
          Fermat, ao estudar retas tangentes, notou que a aproximação feita por retas secantes podia convergir para uma única reta no ponto de tangência, formando o embrião do conceito de derivada. Esses conceitos foram aperfeiçoados por Leibniz e Newton, consolidando o Cálculo Diferencial.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <img 
            src="/image.png" 
            alt="História das Derivadas" 
            style={{ width: '100%', maxWidth: '550px', borderRadius: '8px' }}
          />
        </Box>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button variant="outlined" onClick={() => setPage('home')}>
            Voltar ao Menu
          </Button>
        </Box>
      </Container>
    </motion.div>
  );
}

function HistoriaIntegrais({ setPage }) {
  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          História de Integrais
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <img 
            src="/imgintregais.png" 
            alt="História das Integrais" 
            style={{ width: '100%', maxWidth: '250px', borderRadius: '8px' }}
          />
        </Box>
        <Typography variant="body1" paragraph>
          O conceito de integral tem raízes na antiguidade, quando matemáticos já buscavam calcular áreas e volumes de figuras irregulares. Na Grécia Antiga, o método de exaustão, desenvolvido por Eudoxo e Arquimedes, aproximava essas medidas por meio de subdivisões sucessivas.
        </Typography>
        <Typography variant="body1" paragraph>
          No séc. XVII, com o surgimento do cálculo por Newton e Leibniz, o conceito de integral foi formalmente introduzido. Newton via a integral como o inverso da diferenciação, enquanto Leibniz introduziu o símbolo ∫ para representar a soma contínua de infinitesimais.
        </Typography>
        <Typography variant="body1" paragraph>
          No séc. XIX, as definições formais, como a de Riemann, consolidaram o cálculo integral moderno, que hoje é fundamental em diversas áreas da ciência e engenharia.
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button variant="outlined" onClick={() => setPage('home')}>
            Voltar ao Menu
          </Button>
        </Box>
      </Container>
    </motion.div>
  );
}
function InstrucoesPage({ setPage }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          📖 Manual de Instruções
        </Typography>
        <Typography variant="body1" paragraph>
          Para utilizar a calculadora, insira funções matemáticas em termos de <strong>x</strong>:
        </Typography>
        
        <List disablePadding>
          <ListItem disableGutters>
            <ListItemText
              primary="ln(x)"
              secondary="logaritmo natural"
              primaryTypographyProps={{ fontSize: '1.2rem' }}
              secondaryTypographyProps={{ fontSize: '1rem' }}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText
              primary="sin(x), cos(x), tan(x)"
              secondary="funções trigonométricas"
              primaryTypographyProps={{ fontSize: '1.2rem' }}
              secondaryTypographyProps={{ fontSize: '1rem' }}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText
              primary="asin(x), acos(x), atan(x)"
              secondary="funções arco-trigonométricas"
              primaryTypographyProps={{ fontSize: '1.2rem' }}
              secondaryTypographyProps={{ fontSize: '1rem' }}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText
              primary="cot(x), csc(x), sec(x)"
              secondary="cotangente, cosecante, secante"
              primaryTypographyProps={{ fontSize: '1.2rem' }}
              secondaryTypographyProps={{ fontSize: '1rem' }}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText
              primary="acot(x), acsc(x), asec(x)"
              secondary="arco-cotangente, arco-cosecante, arco-secante"
              primaryTypographyProps={{ fontSize: '1.2rem' }}
              secondaryTypographyProps={{ fontSize: '1rem' }}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText
              primary="sinh(x), cosh(x), tanh(x)"
              secondary="funções hiperbólicas"
              primaryTypographyProps={{ fontSize: '1.2rem' }}
              secondaryTypographyProps={{ fontSize: '1rem' }}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText
              primary="csch(x), sech(x), coth(x)"
              secondary="cosecante, secante, cotangente hiperbólicas"
              primaryTypographyProps={{ fontSize: '1.2rem' }}
              secondaryTypographyProps={{ fontSize: '1rem' }}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText
              primary="asinh(x), acosh(x), atanh(x)"
              secondary="inversas das hiperbólicas"
              primaryTypographyProps={{ fontSize: '1.2rem' }}
              secondaryTypographyProps={{ fontSize: '1rem' }}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText
              primary="acoth(x), asech(x), acsch(x)"
              secondary="inversas hiperbólicas adicionais"
              primaryTypographyProps={{ fontSize: '1.2rem' }}
              secondaryTypographyProps={{ fontSize: '1rem' }}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText
              primary="x**2, x**3, sqrt(x)"
              secondary="potências e raiz quadrada"
              primaryTypographyProps={{ fontSize: '1.2rem' }}
              secondaryTypographyProps={{ fontSize: '1rem' }}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText
              primary="root(n, x)"
              secondary="raízes enésimas (root(3,x) = ∛x)"
              primaryTypographyProps={{ fontSize: '1.2rem' }}
              secondaryTypographyProps={{ fontSize: '1rem' }}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText
              primary="Abs(x), |x|"
              secondary="valor absoluto"
              primaryTypographyProps={{ fontSize: '1.2rem' }}
              secondaryTypographyProps={{ fontSize: '1rem' }}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText
              primary="exp(x), E"
              secondary="exponencial e base de Euler"
              primaryTypographyProps={{ fontSize: '1.2rem' }}
              secondaryTypographyProps={{ fontSize: '1rem' }}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText
              primary="log(x), log(a, x)"
              secondary="logaritmo natural ou em base a"
              primaryTypographyProps={{ fontSize: '1.2rem' }}
              secondaryTypographyProps={{ fontSize: '1rem' }}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText
              primary="pi"
              secondary="constante π"
              primaryTypographyProps={{ fontSize: '1.2rem' }}
              secondaryTypographyProps={{ fontSize: '1rem' }}
            />
          </ListItem>
        </List>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography fontSize="1.1rem" gutterBottom>
          Manual de utilização da Minha Aplicação de Calculo II sobre Derivadas e Integrais.          </Typography>
          <Button variant="outlined" onClick={() => setPage('home')}>
            ← Voltar ao Menu
          </Button>
        </Box>
      </Container>
    </motion.div>
  );
}

function App() {
  const [page, setPage] = useState('home');

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Cálculo II - Derivadas e Integrais</Typography>
        </Toolbar>
      </AppBar>

      {page === 'home' && <HomePage setPage={setPage} />}
      {page === 'derivadas' && <DerivadasPage setPage={setPage} />}
      {page === 'integrais' && <IntegraisPage setPage={setPage} />}
      {page === 'historiaDerivadas' && <HistoriaDerivadas setPage={setPage} />}
      {page === 'historiaIntegrais' && <HistoriaIntegrais setPage={setPage} />}
      {page === 'instrucoes' && <InstrucoesPage setPage={setPage} />}
    </>
  );
}

export default App;
