import assert from 'node:assert/strict';
import {reconstructOcrText} from '../js/tools/image-text-order.js';

const word=(text,x0,x1)=>({text,bbox:{x0,x1}});

const mixed={
 text:'PASSPORT NO 123456 ‏رقم الجواز‎',
 blocks:[{
  paragraphs:[{
   lines:[{
    words:[
     word('PASSPORT',609,855),
     word('NO',871,935),
     word('123456',953,1102),
     word('‏رقم',1247,1318),
     word('الجواز‎',1113,1228)
    ]
   }]
  }]
 }]
};

const result=reconstructOcrText(mixed);
const logical=result.replace(/[\u2066-\u2069]/g,'');
assert.equal(logical,'رقم الجواز PASSPORT NO 123456');
assert.ok(result.startsWith('رقم الجواز '),'Arabic phrase should lead the mixed RTL line');
assert.ok(result.includes('\u2066PASSPORT NO 123456\u2069'),'English run should be isolated inside the RTL line');

const english={
 text:'SURNAME: MOHAMED',
 blocks:[{
  paragraphs:[{
   lines:[{
    words:[
     word('SURNAME:',72,313),
     word('MOHAMED',334,572)
    ]
   }]
  }]
 }]
};
assert.equal(reconstructOcrText(english),'SURNAME: MOHAMED');

const multipleLines={
 blocks:[{
  paragraphs:[{
   lines:[
    {words:[word('الاسم',500,600),word('NAME:',100,250),word('AHMED',270,450)]},
    {words:[word('SURNAME:',100,300),word('MOHAMED',320,550)]}
   ]
  }]
 }]
};
const multi=reconstructOcrText(multipleLines);
assert.equal(multi.replace(/[\u2066-\u2069]/g,''),'الاسم NAME: AHMED\nSURNAME: MOHAMED');

assert.equal(reconstructOcrText({text:'Plain OCR text'}),'Plain OCR text');
console.log('PASS mixed Arabic/English logical order');
console.log('PASS English-only order');
console.log('PASS multiple lines preserve top-to-bottom order');
console.log('PASS fallback when word blocks are unavailable');
