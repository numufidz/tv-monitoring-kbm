#!/usr/bin/env node
/**
 * Convert DB_ASC from WIDE format to LONG format
 * Usage: node convertDbAscToLong.js <input.csv> <output.csv>
 * 
 * Example: node convertDbAscToLong.js DB_ASC_wide.csv DB_ASC_long.csv
 */

const fs = require('fs');
const path = require('path');

// Parse CSV manually (simple implementation)
function parseCSV(csvString) {
  return csvString.trim().split('\n').map(line => {
    // Handle quoted fields
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  });
}

// Escape CSV field
function escapeCSV(field) {
  if (!field) return '';
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

// Determine shift from class code
function getShift(kelas) {
  // PUTRA: 7A-9C, PUTRI: 7D-9H
  const letter = kelas.charAt(1);
  if (letter && letter >= 'D') {
    return 'PUTRI';
  }
  return 'PUTRA';
}

// Main conversion function
function convertToLong(rows) {
  if (rows.length < 2) {
    throw new Error('Invalid CSV: need at least header + 1 data row');
  }

  const header = rows[0];
  const dataRows = rows.slice(1);

  // Find column indices
  const hariIdx = header.indexOf('HARI');
  const jamKeIdx = header.indexOf('Jam Ke-');

  if (hariIdx === -1 || jamKeIdx === -1) {
    throw new Error('Missing HARI or Jam Ke- column');
  }

  // Class columns start after Jam Ke-
  const classColumns = header.slice(jamKeIdx + 1);

  // Output data
  const output = [['HARI', 'Jam Ke-', 'Shift', 'Kelas', 'KODE_DB_ASC']];

  // Process each row
  dataRows.forEach((row, rowIdx) => {
    const hari = row[hariIdx]?.trim();
    const jamKe = row[jamKeIdx]?.trim();

    // Skip separator rows (empty HARI or Jam Ke-)
    if (!hari || !jamKe) {
      return;
    }

    // Process each class column
    classColumns.forEach((kelas, colIdx) => {
      const actualIdx = jamKeIdx + 1 + colIdx;
      const kodeGuru = row[actualIdx]?.trim();

      // Skip empty cells
      if (!kodeGuru) {
        return;
      }

      const shift = getShift(kelas);
      output.push([hari, jamKe, shift, kelas, kodeGuru]);
    });
  });

  return output;
}

// Write CSV
function writeCSV(data, filePath) {
  const csv = data.map(row => row.map(field => escapeCSV(field)).join(',')).join('\n');
  fs.writeFileSync(filePath, csv + '\n', 'utf8');
}

// Main
function main() {
  const inputFile = process.argv[2];
  const outputFile = process.argv[3];

  if (!inputFile || !outputFile) {
    console.error('Usage: node convertDbAscToLong.js <input.csv> <output.csv>');
    console.error('Example: node convertDbAscToLong.js DB_ASC_wide.csv DB_ASC_long.csv');
    process.exit(1);
  }

  try {
    // Read input
    console.log(`📖 Reading: ${inputFile}`);
    const csvContent = fs.readFileSync(inputFile, 'utf8');
    const rows = parseCSV(csvContent);

    console.log(`📊 Input rows: ${rows.length}`);
    console.log(`📋 Columns: ${rows[0].length}`);

    // Convert
    console.log('🔄 Converting WIDE → LONG format...');
    const longData = convertToLong(rows);

    // Write output
    console.log(`✍️  Writing: ${outputFile}`);
    writeCSV(longData, outputFile);

    console.log(`\n✅ Success!`);
    console.log(`📊 Output rows: ${longData.length} (including header)`);
    console.log(`📋 Output columns: 5 (HARI, Jam Ke-, Shift, Kelas, KODE_DB_ASC)`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
