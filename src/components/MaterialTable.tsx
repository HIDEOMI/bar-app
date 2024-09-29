import React, { useEffect, useState } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Table, TableContainer, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { Input } from '@mui/material';
import { RowData } from '@tanstack/table-core';
import { Material } from '../types/types';


/** TableMeta を拡張して updateData を定義 */
declare module '@tanstack/table-core' {
    interface TableMeta<TData extends RowData> {
        updateData: (rowIndex: number, columnId: string, value: unknown) => void;
        handleDeleteMaterial: (id: string) => void;
    }
}

export interface BasicTableProps {
    materials: Material[];
    handlePendingUpdate: (updateInfo: { [key: string]: any; id: string; }) => Promise<void>;
    handleDeleteMaterial: (id: string) => Promise<void>;
}

/** カラム定義 */
const columns: ColumnDef<Material, any>[] = [
    {
        id: 'delete',
        header: '削除',
        cell: ({ row, table }) => (
            <button onClick={() => table.options.meta?.handleDeleteMaterial(row.original.id)}>削除</button>
        ),
    },
    {
        accessorKey: 'category',
        header: 'カテゴリ',
    },
    {
        accessorKey: 'name',
        header: '名前',
        size: 500,
    },
    {
        accessorKey: 'totalAmount',
        header: '数量',
    },
    {
        accessorKey: 'teiban',
        header: '定番',
    },
    {
        accessorKey: 'unitPrice',
        header: '単価',
    },
    {
        accessorKey: 'unitCapacity',
        header: '単位量',
    },
    {
        accessorKey: 'note',
        header: '備考',
    },
    {
        accessorKey: 'url',
        header: 'URL',
    },
];

/** デフォルトカラムの定義 */
const defaultColumn: Partial<ColumnDef<Material>> = {
    cell: React.memo(({ getValue, row: { index }, column: { id }, table }) => {
        const initialValue = getValue();
        const [value, setValue] = useState(initialValue);

        const onBlur = () => {
            table.options.meta?.updateData(index, id, value);
        };

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
    }),
};


/** BasicTable コンポーネント */
export const BasicTable: React.FC<BasicTableProps> = React.memo(({ materials, handlePendingUpdate, handleDeleteMaterial }) => {
    // const [updateData, setUdpateData] = useState<{ [key: string]: any; id: string }[]>([]);

    const table = useReactTable<Material>({
        data: materials,
        columns,
        defaultColumn,
        getCoreRowModel: getCoreRowModel(),
        enableGlobalFilter: true, // グローバルフィルタを有効にする
        enableColumnFilters: true, // カラムごとのフィルタを有効にする
        meta: {
            updateData: (rowIndex: number, columnId: string, value: any) => {
                console.log(`table update data: rowIndex=${rowIndex}, columnId=${columnId}, value=${value}`);
                const updateInfo = { id: materials[rowIndex].id, [columnId]: value };
                handlePendingUpdate(updateInfo);
            },
            handleDeleteMaterial,
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
});
