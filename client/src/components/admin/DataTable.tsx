import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  format?: (value: any) => string | React.ReactNode;
}

interface DataTableProps {
  title: string;
  columns: Column[];
  data: any[];
  onAdd: () => void;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({
  title,
  columns,
  data,
  onAdd,
  onEdit,
  onDelete,
  loading = false,
}) => {
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', mb: 3 }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{title}</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAdd}
          color="primary"
        >
          Add New
        </Button>
      </Box>
      
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  style={{ minWidth: column.minWidth }}
                  sx={{ fontWeight: 'bold' }}
                >
                  {column.label}
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow hover key={row._id || index}>
                {columns.map((column) => {
                  const value = row[column.id];
                  return (
                    <TableCell key={column.id}>
                      {column.format ? column.format(value) : value}
                    </TableCell>
                  );
                })}
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => onEdit(row)}
                    color="primary"
                    sx={{ mr: 1 }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onDelete(row._id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {loading && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography>Loading...</Typography>
        </Box>
      )}
      
      {!loading && data.length === 0 && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="textSecondary">No data found</Typography>
        </Box>
      )}
    </Paper>
  );
};

export default DataTable;
