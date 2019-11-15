/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */

import { assert } from 'chai';
import { wcwidthV6, getStringCellWidthV6, getStringCellWidthV11 } from 'common/CharWidth';

it('wcwidth should match all values from the old implementation', function(): void {
  // old implementation
  const wcwidthOld = (function(opts: {nul: number, control: number}): (ucs: number) => number {
    // extracted from https://www.cl.cam.ac.uk/%7Emgk25/ucs/wcwidth.c
    // combining characters
    const COMBINING_BMP = [
      [0x0300, 0x036F], [0x0483, 0x0486], [0x0488, 0x0489],
      [0x0591, 0x05BD], [0x05BF, 0x05BF], [0x05C1, 0x05C2],
      [0x05C4, 0x05C5], [0x05C7, 0x05C7], [0x0600, 0x0603],
      [0x0610, 0x0615], [0x064B, 0x065E], [0x0670, 0x0670],
      [0x06D6, 0x06E4], [0x06E7, 0x06E8], [0x06EA, 0x06ED],
      [0x070F, 0x070F], [0x0711, 0x0711], [0x0730, 0x074A],
      [0x07A6, 0x07B0], [0x07EB, 0x07F3], [0x0901, 0x0902],
      [0x093C, 0x093C], [0x0941, 0x0948], [0x094D, 0x094D],
      [0x0951, 0x0954], [0x0962, 0x0963], [0x0981, 0x0981],
      [0x09BC, 0x09BC], [0x09C1, 0x09C4], [0x09CD, 0x09CD],
      [0x09E2, 0x09E3], [0x0A01, 0x0A02], [0x0A3C, 0x0A3C],
      [0x0A41, 0x0A42], [0x0A47, 0x0A48], [0x0A4B, 0x0A4D],
      [0x0A70, 0x0A71], [0x0A81, 0x0A82], [0x0ABC, 0x0ABC],
      [0x0AC1, 0x0AC5], [0x0AC7, 0x0AC8], [0x0ACD, 0x0ACD],
      [0x0AE2, 0x0AE3], [0x0B01, 0x0B01], [0x0B3C, 0x0B3C],
      [0x0B3F, 0x0B3F], [0x0B41, 0x0B43], [0x0B4D, 0x0B4D],
      [0x0B56, 0x0B56], [0x0B82, 0x0B82], [0x0BC0, 0x0BC0],
      [0x0BCD, 0x0BCD], [0x0C3E, 0x0C40], [0x0C46, 0x0C48],
      [0x0C4A, 0x0C4D], [0x0C55, 0x0C56], [0x0CBC, 0x0CBC],
      [0x0CBF, 0x0CBF], [0x0CC6, 0x0CC6], [0x0CCC, 0x0CCD],
      [0x0CE2, 0x0CE3], [0x0D41, 0x0D43], [0x0D4D, 0x0D4D],
      [0x0DCA, 0x0DCA], [0x0DD2, 0x0DD4], [0x0DD6, 0x0DD6],
      [0x0E31, 0x0E31], [0x0E34, 0x0E3A], [0x0E47, 0x0E4E],
      [0x0EB1, 0x0EB1], [0x0EB4, 0x0EB9], [0x0EBB, 0x0EBC],
      [0x0EC8, 0x0ECD], [0x0F18, 0x0F19], [0x0F35, 0x0F35],
      [0x0F37, 0x0F37], [0x0F39, 0x0F39], [0x0F71, 0x0F7E],
      [0x0F80, 0x0F84], [0x0F86, 0x0F87], [0x0F90, 0x0F97],
      [0x0F99, 0x0FBC], [0x0FC6, 0x0FC6], [0x102D, 0x1030],
      [0x1032, 0x1032], [0x1036, 0x1037], [0x1039, 0x1039],
      [0x1058, 0x1059], [0x1160, 0x11FF], [0x135F, 0x135F],
      [0x1712, 0x1714], [0x1732, 0x1734], [0x1752, 0x1753],
      [0x1772, 0x1773], [0x17B4, 0x17B5], [0x17B7, 0x17BD],
      [0x17C6, 0x17C6], [0x17C9, 0x17D3], [0x17DD, 0x17DD],
      [0x180B, 0x180D], [0x18A9, 0x18A9], [0x1920, 0x1922],
      [0x1927, 0x1928], [0x1932, 0x1932], [0x1939, 0x193B],
      [0x1A17, 0x1A18], [0x1B00, 0x1B03], [0x1B34, 0x1B34],
      [0x1B36, 0x1B3A], [0x1B3C, 0x1B3C], [0x1B42, 0x1B42],
      [0x1B6B, 0x1B73], [0x1DC0, 0x1DCA], [0x1DFE, 0x1DFF],
      [0x200B, 0x200F], [0x202A, 0x202E], [0x2060, 0x2063],
      [0x206A, 0x206F], [0x20D0, 0x20EF], [0x302A, 0x302F],
      [0x3099, 0x309A], [0xA806, 0xA806], [0xA80B, 0xA80B],
      [0xA825, 0xA826], [0xFB1E, 0xFB1E], [0xFE00, 0xFE0F],
      [0xFE20, 0xFE23], [0xFEFF, 0xFEFF], [0xFFF9, 0xFFFB]
    ];
    const COMBINING_HIGH = [
      [0x10A01, 0x10A03], [0x10A05, 0x10A06], [0x10A0C, 0x10A0F],
      [0x10A38, 0x10A3A], [0x10A3F, 0x10A3F], [0x1D167, 0x1D169],
      [0x1D173, 0x1D182], [0x1D185, 0x1D18B], [0x1D1AA, 0x1D1AD],
      [0x1D242, 0x1D244], [0xE0001, 0xE0001], [0xE0020, 0xE007F],
      [0xE0100, 0xE01EF]
    ];
    // binary search
    function bisearch(ucs: number, data: number[][]): boolean {
      let min = 0;
      let max = data.length - 1;
      let mid;
      if (ucs < data[0][0] || ucs > data[max][1]) {
        return false;
      }
      while (max >= min) {
        mid = (min + max) >> 1;
        if (ucs > data[mid][1]) {
          min = mid + 1;
        } else if (ucs < data[mid][0]) {
          max = mid - 1;
        } else {
          return true;
        }
      }
      return false;
    }
    function wcwidthBMP(ucs: number): number {
      // test for 8-bit control characters
      if (ucs === 0) {
        return opts.nul;
      }
      if (ucs < 32 || (ucs >= 0x7f && ucs < 0xa0)) {
        return opts.control;
      }
      // binary search in table of non-spacing characters
      if (bisearch(ucs, COMBINING_BMP)) {
        return 0;
      }
      // if we arrive here, ucs is not a combining or C0/C1 control character
      if (isWideBMP(ucs)) {
        return 2;
      }
      return 1;
    }
    function isWideBMP(ucs: number): boolean {
      return (
        ucs >= 0x1100 && (
        ucs <= 0x115f ||                // Hangul Jamo init. consonants
        ucs === 0x2329 ||
        ucs === 0x232a ||
        (ucs >= 0x2e80 && ucs <= 0xa4cf && ucs !== 0x303f) ||  // CJK..Yi
        (ucs >= 0xac00 && ucs <= 0xd7a3) ||    // Hangul Syllables
        (ucs >= 0xf900 && ucs <= 0xfaff) ||    // CJK Compat Ideographs
        (ucs >= 0xfe10 && ucs <= 0xfe19) ||    // Vertical forms
        (ucs >= 0xfe30 && ucs <= 0xfe6f) ||    // CJK Compat Forms
        (ucs >= 0xff00 && ucs <= 0xff60) ||    // Fullwidth Forms
        (ucs >= 0xffe0 && ucs <= 0xffe6)));
    }
    function wcwidthHigh(ucs: number): 0 | 1 | 2 {
      if (bisearch(ucs, COMBINING_HIGH)) {
        return 0;
      }
      if ((ucs >= 0x20000 && ucs <= 0x2fffd) || (ucs >= 0x30000 && ucs <= 0x3fffd)) {
        return 2;
      }
      return 1;
    }
    const control = opts.control | 0;
    let table: number[] | Uint32Array | undefined;
    function initTable(): number[] | Uint32Array {
      // lookup table for BMP
      const CODEPOINTS = 65536;  // BMP holds 65536 codepoints
      const BITWIDTH = 2;        // a codepoint can have a width of 0, 1 or 2
      const ITEMSIZE = 32;       // using uint32_t
      const CONTAINERSIZE = CODEPOINTS * BITWIDTH / ITEMSIZE;
      const CODEPOINTS_PER_ITEM = ITEMSIZE / BITWIDTH;
      table = (typeof Uint32Array === 'undefined')
        ? new Array(CONTAINERSIZE)
        : new Uint32Array(CONTAINERSIZE);
      for (let i = 0; i < CONTAINERSIZE; ++i) {
        let num = 0;
        let pos = CODEPOINTS_PER_ITEM;
        while (pos--) {
          num = (num << 2) | wcwidthBMP(CODEPOINTS_PER_ITEM * i + pos);
        }
        table[i] = num;
      }
      return table;
    }
    // get width from lookup table
    //   position in container   : num / CODEPOINTS_PER_ITEM
    //     ==> n = table[Math.floor(num / 16)]
    //     ==> n = table[num >> 4]
    //   16 codepoints per number:       FFEEDDCCBBAA99887766554433221100
    //   position in number      : (num % CODEPOINTS_PER_ITEM) * BITWIDTH
    //     ==> m = (n % 16) * 2
    //     ==> m = (num & 15) << 1
    //   right shift to position m
    //     ==> n = n >> m     e.g. m=12  000000000000FFEEDDCCBBAA99887766
    //   we are only interested in 2 LSBs, cut off higher bits
    //     ==> n = n & 3      e.g.       000000000000000000000000000000XX
    return function (num: number): number {
      num = num | 0;  // get asm.js like optimization under V8
      if (num < 32) {
        return control | 0;
      }
      if (num < 127) {
        return 1;
      }
      const t = table || initTable();
      if (num < 65536) {
        return t[num >> 4] >> ((num & 15) << 1) & 3;
      }
      // do a full search for high codepoints
      return wcwidthHigh(num);
    };
  })({nul: 0, control: 0}); // configurable options

  // test full BMP range old vs new implmenetation
  for (let i = 0; i < 65536; ++i) {
    assert.equal(wcwidthV6(i), wcwidthOld(i), `mismatch for i: ${i}`);
  }
});

it('wcwidth V6 vs. V11', () => {
  const widthV6 = getStringCellWidthV6('🤣🤣🤣🤣🤣🤣🤣🤣🤣🤣');
  assert.equal(widthV6, 10);
  const widthV10 = getStringCellWidthV11('🤣🤣🤣🤣🤣🤣🤣🤣🤣🤣');
  assert.equal(widthV10, 20);
});
