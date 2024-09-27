import React, { useEffect, useState } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Table, TableContainer, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { Input } from '@mui/material';
import { RowData } from '@tanstack/table-core';
import { Material } from '../types/types';

// TableMeta を拡張して updateData を定義
declare module '@tanstack/table-core' {
    interface TableMeta<TData extends RowData> {
        updateData: (rowIndex: number, columnId: string, value: unknown) => void;
    }
}

interface BasicTableProps {
    materials: Material[];
}

// カラム定義
const columns: ColumnDef<Material, any>[] = [
    {
        accessorKey: 'name',
        header: '名前',
    },
    {
        accessorKey: 'unitPrice',
        header: '単価',
    },
];

// デフォルトカラムの定義
const defaultColumn: Partial<ColumnDef<Material>> = {
    cell: ({ getValue, row: { index }, column: { id }, table }) => {
        const initialValue = getValue();
        if (id !== 'name') {
            return <>{initialValue}</>;
        }
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [value, setValue] = useState(initialValue);

        const onBlur = () => {
            table.options.meta?.updateData(index, id, value);
        };

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            setValue(initialValue);
        }, [initialValue]);

        return (
            <Input
                value={value as string}
                onChange={(e) => setValue(e.target.value)}
                onBlur={onBlur}
            />
        );
    },
};

// BasicTable コンポーネント
export const BasicTable: React.FC<BasicTableProps> = ({ materials }) => {
    const table = useReactTable<Material>({
        data: materials,
        columns,
        defaultColumn,
        getCoreRowModel: getCoreRowModel(),
        meta: {
            updateData: (rowIndex: number, columnId: string, value: any) => {
                console.log(`table update data: rowIndex=${rowIndex}, columnId=${columnId}, value=${value}`);
            },
        },
    });

    return (
        <TableContainer>
            <Table>
                <Thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <Tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <Th key={header.id}>
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                </Th>
                            ))}
                        </Tr>
                    ))}
                </Thead>
                <Tbody>
                    {table.getRowModel().rows.map((row) => (
                        <Tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <Td key={cell.id} borderX="1px solid #e2e8f0">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </Td>
                            ))}
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </TableContainer>
    );
};
