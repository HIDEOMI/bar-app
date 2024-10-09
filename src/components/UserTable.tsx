import React, { useEffect, useState } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Table, TableContainer, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { Input } from '@mui/material';
import { RowData } from '@tanstack/table-core';
import { User } from '../types/types';


/** TableMeta を拡張して updateData を定義 */
declare module '@tanstack/table-core' {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    interface TableMeta<TData extends RowData> {
        updateData: (rowIndex: number, columnId: string, value: unknown) => void;
        handleDeleteRow: (id: string) => void;
    }
}

interface BasicTableProps {
    users: User[];
    roles: string[];
    handlePendingUpdate: (updateInfo: { [key: string]: any; id: string; }) => Promise<void>;
    handleDeleteRow: (id: string) => Promise<void>;
}

/** カラム定義 */
const columns: ColumnDef<User, any>[] = [
    {
        id: 'delete',
        header: '削除',
        cell: ({ row, table }) => (
            <button onClick={() => table.options.meta?.handleDeleteRow(row.original.id)}>削除</button>
        ),
    },
    {
        accessorKey: 'displayName',
        header: '名前',
    },
    {
        accessorKey: 'role',
        header: 'Role',
    },
];

/** デフォルトカラムの定義 */
const defaultColumn: Partial<ColumnDef<User>> = {
    cell: React.memo(({ getValue, row: { index }, column: { id }, table }) => {
        const initialValue = getValue();
        const [value, setValue] = useState(initialValue);
        const [isEdited, setIsEdited] = useState(false);  // 編集状態を管理


        const onBlur = () => {
            if (value !== initialValue) { // 値が変更された場合
                setIsEdited(true);
                table.options.meta?.updateData(index, id, value);
            }
        };


        useEffect(() => {
            setValue(initialValue);
            setIsEdited(false); // 初期値に戻った場合は編集状態をリセット
        }, [initialValue]);

        return (
            <Input
                value={value as string}
                onChange={(e) => setValue(e.target.value)}
                onBlur={onBlur}
                style={{ color: isEdited ? 'red' : 'inherit' }} // 編集された場合に赤くする
            />
        );
    }),
};


/** UserTable コンポーネント */
export const UserTable: React.FC<BasicTableProps> = React.memo(({ users, handlePendingUpdate, handleDeleteRow }) => {
    // const [updateData, setUdpateData] = useState<{ [key: string]: any; id: string }[]>([]);

    const table = useReactTable<User>({
        data: users,
        columns,
        defaultColumn,
        getCoreRowModel: getCoreRowModel(),
        enableGlobalFilter: true, // グローバルフィルタを有効にする
        enableColumnFilters: true, // カラムごとのフィルタを有効にする
        meta: {
            updateData: (rowIndex: number, columnId: string, value: any) => {
                console.log(`table update data: rowIndex=${rowIndex}, columnId=${columnId}, value=${value}`);
                const updateInfo = { id: users[rowIndex].id, [columnId]: value };
                handlePendingUpdate(updateInfo);
            },
            handleDeleteRow,
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
