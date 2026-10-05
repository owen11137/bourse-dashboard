import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Chip, Container, Divider, InputAdornment, LinearProgress, Paper, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import IranMarketPanel from './IranMarketPanel';
import Refresh from '@mui/icons-material/Refresh';
import Search from '@mui/icons-material/Search';
import TrendingUp from '@mui/icons-material/TrendingUp';
import TrendingDown from '@mui/icons-material/TrendingDown';
import Diamond from '@mui/icons-material/Diamond';
import Dashboard from '@mui/icons-material/Dashboard';
import ArrowBack from '@mui/icons-material/ArrowBack';
const colors={XAU:'#cf9e38',XAG:'#8b9db4',XPT:'#758bab',XPD:'#ab8bb9',CU:'#c78252',AL:'#87a6bf',ZN:'#639b93',NI:'#84945d'};
const units={troy_ounce:'اونس تروا',metric_ton:'تن متریک'};
const money=new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
function Change({value}) { return <Chip size="small" icon={value>=0?<TrendingUp/>:<TrendingDown/>} label={<span dir="ltr">{value>0?'+':''}{value.toFixed(2)}%</span>} sx={{color:value>=0?'#16836a':'#c14a5e',backgroundColor:value>=0?'#e9f7f1':'#fceef1',fontWeight:700}}/>; }
function GlobalMetals() {
 const [data,setData]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[query,setQuery]=useState(''),[category,setCategory]=useState('all');
 const active=useRef(null);
 async function load() {
  active.current?.abort(); const controller=new AbortController(); active.current=controller;
  setLoading(true);setError('');
  const timeout=setTimeout(()=>controller.abort(),15000);
  try { const response=await fetch('/api/v1/metals/prices',{signal:controller.signal}); if(!response.ok)throw new Error(response.status===503?'کلید دسترسی BrsAPI در سرور تنظیم نشده است.':'دریافت قیمت از BrsAPI انجام نشد. دوباره تلاش کنید.'); const payload=await response.json();
   if(!Array.isArray(payload.metals)||payload.metals.some(m=>typeof m.price!=='number'||typeof m.changePercent!=='number')||!Number.isFinite(Date.parse(payload.updatedAt)))throw new Error();
   if(active.current===controller)setData(payload);
  } catch(e) { if(active.current===controller)setError(e.message&&e.name!=='AbortError'?e.message:'دریافت قیمت‌ها انجام نشد. اتصال به سرور را بررسی و دوباره تلاش کنید.'); }
  finally {clearTimeout(timeout);if(active.current===controller)setLoading(false);}
 }
 useEffect(()=>{load();return()=>{active.current?.abort();active.current=null;};},[]);
 const rows=(data?.metals??[]).filter(m=>(category==='all'||m.category===category)&&(m.name.includes(query.trim())||m.symbol.toLowerCase().includes(query.trim().toLowerCase())));
 return <Box>
  <Container maxWidth="xl" sx={{py:{xs:3,md:5}}}>
   <Typography variant="body2" color="text.secondary" sx={{mb:3}}>داشبورد / بازار جهانی / فلزات</Typography>
   <Stack direction={{xs:'column',sm:'row'}} justifyContent="space-between" spacing={2} sx={{mb:3}}><Box><Typography variant="h4" sx={{fontSize:{xs:26,md:34},mb:1}}>قیمت جهانی فلزات</Typography><Typography color="text.secondary">قیمت اونس جهانی طلا به دلار آمریکا، از BrsAPI</Typography></Box><Button variant="contained" startIcon={<Refresh/>} onClick={load} disabled={loading} sx={{alignSelf:'flex-start',px:3,py:1.3}}>به‌روزرسانی</Button></Stack>
   <Alert severity="info" sx={{mb:3}}>این منبع در حال حاضر فقط اونس جهانی طلا را پوشش می‌دهد. قیمت سایر فلزات در این API موجود نیست. داده‌ها تا ۶۰ ثانیه کش می‌شوند؛ زمان نمایش‌داده‌شده، زمان ثبت قیمت در منبع است و لحظه‌ای بودن آن تضمین نمی‌شود.</Alert>
   {error&&<Alert severity="error" sx={{mb:3}} action={<Button color="inherit" onClick={load} disabled={loading}>تلاش مجدد</Button>}>{error}{data&&' اطلاعات قبلی نمایش داده می‌شود.'}</Alert>}
   <Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',sm:'repeat(2,1fr)',lg:'repeat(4,1fr)'},gap:2.5,mb:4}}>
   {(data?.metals??(loading?[null]:[])).map((m,i)=><Paper key={m?.symbol??i} variant="outlined" sx={{p:3,borderColor:'#e3e8f1',position:'relative',overflow:'hidden'}}><Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb:3}}><Stack direction="row" spacing={1.5} alignItems="center"><Box sx={{display:'flex',p:1.2,bgcolor:'#f6f7fa',borderRadius:2,color:colors[m?.symbol]??'#8b9db4'}}><Diamond/></Box><Box><Typography fontWeight={700}>{m?.name??<Skeleton width={60}/>}</Typography><Typography variant="caption" color="text.secondary">{m?.symbol??'—'}</Typography></Box></Stack><Typography variant="caption" color="text.secondary">USD</Typography></Stack><Typography variant="h4" dir="ltr" sx={{textAlign:'right',fontSize:30,mb:1}}>{m?money.format(m.price):<Skeleton/>}</Typography><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="caption" color="text.secondary">دلار / {units[m?.unit]??'اونس تروا'}</Typography>{m&&<Change value={m.changePercent}/>}</Stack></Paper>)}
   </Box>
   <Paper variant="outlined" sx={{borderColor:'#e3e8f1',overflow:'hidden'}}>
    <Box sx={{p:3}}><Stack direction={{xs:'column',md:'row'}} justifyContent="space-between" spacing={2} alignItems={{md:'center'}}><Box><Typography variant="h6">دیده‌بان فلزات</Typography><Typography variant="body2" color="text.secondary" sx={{mt:0.5}}>مقایسه قیمت و تغییر روزانه در یک نگاه</Typography></Box><TextField size="small" placeholder="جست‌وجوی نام یا نماد فلز" value={query} onChange={e=>setQuery(e.target.value)} slotProps={{input:{startAdornment:<InputAdornment position="start"><Search/></InputAdornment>},htmlInput:{'aria-label':'جست‌وجوی فلز'}}}/></Stack><ToggleButtonGroup exclusive size="small" value={category} onChange={(_,value)=>value&&setCategory(value)} sx={{mt:2.5}}><ToggleButton value="all">همه فلزات</ToggleButton><ToggleButton value="precious">گران‌بها</ToggleButton><ToggleButton value="industrial">صنعتی</ToggleButton></ToggleButtonGroup></Box>
    {loading&&<LinearProgress aria-label="دریافت قیمت‌ها"/>}<Divider/>
    <TableContainer><Table sx={{minWidth:620}} aria-label="قیمت جهانی فلزات"><TableHead sx={{bgcolor:'#f8f9fc'}}><TableRow>{['فلز / نماد','قیمت (دلار)','واحد','تغییر روزانه','نوع فلز'].map(t=><TableCell key={t} sx={{color:'#6b778d',fontWeight:700}}>{t}</TableCell>)}</TableRow></TableHead><TableBody>{rows.map(m=><TableRow key={m.symbol} hover><TableCell><Stack direction="row" spacing={1.5} alignItems="center"><Box sx={{width:9,height:9,borderRadius:'50%',bgcolor:colors[m.symbol]}}/><Box><Typography fontWeight={700} variant="body2">{m.name}</Typography><Typography variant="caption" color="text.secondary">{m.symbol}</Typography></Box></Stack></TableCell><TableCell><Typography dir="ltr" sx={{textAlign:'right',fontWeight:700,fontVariantNumeric:'tabular-nums'}}>{money.format(m.price)}</Typography></TableCell><TableCell>{units[m.unit]??m.unit}</TableCell><TableCell><Change value={m.changePercent}/></TableCell><TableCell><Chip size="small" variant="outlined" label={m.category==='precious'?'گران‌بها':'صنعتی'}/></TableCell></TableRow>)}{!loading&&rows.length===0&&<TableRow><TableCell colSpan={5} align="center" sx={{py:5}}>{data?'فلزی با این مشخصات پیدا نشد.':'هنوز اطلاعاتی دریافت نشده است.'}</TableCell></TableRow>}</TableBody></Table></TableContainer>
    <Box sx={{p:2.5,bgcolor:'#fafbfd'}}><Stack direction={{xs:'column',sm:'row'}} justifyContent="space-between" spacing={1}><Typography variant="caption" color="text.secondary">زمان دادهٔ منبع: {data?new Date(data.updatedAt).toLocaleString('fa-IR',{timeZone:'Asia/Tehran'}):'—'} (تهران)</Typography><Typography variant="caption" color="text.secondary">{rows.length} فلز · منبع: BrsAPI</Typography></Stack></Box>
   </Paper>
   <Stack direction="row" alignItems="center" spacing={1} sx={{mt:3,color:'text.secondary'}}><ArrowBack sx={{fontSize:16}}/><Typography variant="caption">بورس‌نما · دیده‌بان بازارهای مالی</Typography></Stack>
  </Container>
 </Box>;
}

export default function App() {
 const [market, setMarket] = useState('indices');
 return <Box>
  <Box component="nav" aria-label="انتخاب بازار" sx={{ bgcolor: '#111b2e', color: 'white', py: 2 }}>
   <Container maxWidth="xl"><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
    <Stack direction="row" spacing={1} alignItems="center"><Dashboard /><Typography variant="h6">بورس‌نما</Typography></Stack>
    <ToggleButtonGroup exclusive value={market} onChange={(_, value) => value && setMarket(value)} aria-label="بازار" sx={{ flexWrap: 'wrap', gap: 1, '& .MuiToggleButton-root': { color: '#cbd5e1', border: '1px solid #475569', borderRadius: '8px !important', px: 2 }, '& .MuiToggleButton-root.Mui-selected': { bgcolor: '#3857dd', color: '#fff', '&:hover': { bgcolor: '#2945b8' } } }}>
     <ToggleButton value="indices">شاخص‌های بورس ایران</ToggleButton>
     <ToggleButton value="commodities">بورس کالا</ToggleButton>
     <ToggleButton value="global">فلزات جهانی</ToggleButton>
    </ToggleButtonGroup>
   </Stack></Container>
  </Box>
  {market === 'global' ? <GlobalMetals /> : <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}><Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>داشبورد / بازار ایران / {market === 'indices' ? 'شاخص‌ها' : 'بورس کالا'}</Typography><IranMarketPanel key={market} market={market} /></Container>}
 </Box>;
}
