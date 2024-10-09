import React, { useEffect, useState } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Table, TableContainer, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { Input } from '@mui/material';
import { RowData } from '@tanstack/table-core';
import { Material } from '../types/types';


/** TableMeta を拡張して updateData を定義 */
declare module '@tanstack/table-core' {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    interface TableMeta<TData extends RowData> {
        updateData: (rowIndex: number, columnId: string, value: unknown) => void;
        handleDeleteRow: (id: string) => void;
    }
}

interface BasicTableProps {
    materials: Material[];
    handlePendingUpdate: (updateInfo: { [key: string]: any; id: string; }) => Promise<void>;
    handleDeleteRow: (id: string) => Promise<void>;
}

/** カラム定義 */
const columns: ColumnDef<Material, any>[] = [
    {
        id: 'delete',
        header: '削除',
        cell: ({ row, table }) => (
            <button onClick={() => table.options.meta?.handleDeleteRow(row.original.id)}>削除</button>
        ),
        size: 50,
    },
    {
        accessorKey: 'category',
        header: 'カテゴリ',
        size: 70,
    },
    {
        accessorKey: 'name',
        header: '名前',
        size: 200,
    },
    {
        accessorKey: 'totalAmount',
        header: '数量',
        size: 50,
    },
    {
        accessorKey: 'teiban',
        header: '定番',
        size: 50,
    },
    {
        accessorKey: 'unitPrice',
        header: '単価',
        size: 50,
    },
    {
        accessorKey: 'unitCapacity',
        header: '単位量',
        size: 50,
    },
    {
        accessorKey: 'note',
        header: '備考',
        size: 200,
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


/** MaterialTable コンポーネント */
export const MaterialTable: React.FC<BasicTableProps> = React.memo(({ materials, handlePendingUpdate, handleDeleteRow }) => {
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
            handleDeleteRow,
        },
    });

    return (
        <TableContainer
            style={{ maxHeight: '800px', overflowY: 'auto' }}  // コンテナにスクロールを追加
        >
            <Table>
                <Thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <Tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <Th
                                    key={header.id}
                                    width={`${header.column.columnDef.size}px`}
                                    style={{ fontSize: '30px !important' }}  // style オブジェクトで指定
                                    position="sticky"  // ヘッダーを固定
                                    top={0}  // スクロール時の固定位置
                                    zIndex={1}  // ヘッダーがスクロール中に他の要素より前面に表示されるように
                                    backgroundColor="white"  // 背景色を設定
                                >
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
                                <Td
                                    key={cell.id}
                                    width={`${cell.column.columnDef.size}px`}
                                    style={{ fontSize: '30px !important' }}  // style オブジェクトで指定
                                    borderX="1px solid #e2e8f0"
                                >
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
