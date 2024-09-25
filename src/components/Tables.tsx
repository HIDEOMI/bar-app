import { useMemo } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
} from 'material-react-table';
import { Material } from '../types/types';
import { MRT_Localization_JA } from 'material-react-table/locales/ja';


interface MaterialsTableProps {
    materialData: Material[];
}

const MaterialsTable: React.FC<MaterialsTableProps> = ({ materialData }) => {
    // カラムの定義
    const columns = useMemo<MRT_ColumnDef<Material>[]>(
        () => [
            // keyを直接指定する場合
            {
                accessorKey: 'name',
                header: 'Name',
                muiTableHeadCellProps: { style: { color: 'red' } },
                enableHiding: false,
            },
            {
                accessorKey: 'totalAmount',
                header: 'totalAmount',
                enableHiding: false,
            },
            {
                accessorKey: 'category',
                header: 'category',
                enableHiding: false,
            },
            {
                accessorKey: 'teiban',
                header: 'standard',
                enableHiding: false,
            },
            {
                accessorFn: (originalRow) => parseInt(String(originalRow.unitPrice)),
                id: 'unitPrice',
                header: 'unitPrice',
                Header: <i>単価</i>,
                Cell: ({ cell }) => <i>￥{cell.getValue<Number>().toLocaleString()}</i>,
            },
            {
                accessorFn: (originalRow) => parseInt(String(originalRow.unitCapacity)),
                id: 'unitCapacity',
                header: 'unitCapacity',
                Header: <i>容量</i>,
                Cell: ({ cell }) => <i>{cell.getValue<Number>().toLocaleString()}ml</i>,
            },
            {
                accessorFn: (originalRow) => parseInt(String(originalRow.url)),
                id: 'url',
                header: 'url',
                Header: <i>url</i>,
                Cell: ({ cell }) => <i>{cell.getValue<String>()}</i>,
            },
            {
                accessorKey: 'note',
                header: 'Note',
                enableHiding: false,
                Header: <i style={{ color: 'red' }}>備考</i>,

            },
            // // keyを関数を使用して加工する場合
            // {
            //     accessorFn: (originalRow) => parseInt(String(originalRow.category)),
            //     id: 'id',
            //     header: 'Id',
            //     Header: <i style={{ color: 'red' }}>Id</i>,
            //     Cell: ({ cell }) => <i>{cell.getValue<number>().toLocaleString()}</i>,
            // },
        ],
        [],
    );

    // テーブルの定義
    const table = useMaterialReactTable({
        columns: columns,
        data: materialData,
        enableRowSelection: true,
        // enableColumnOrdering: true,
        enableGlobalFilter: false,
        enableColumnResizing: true,
        localization: MRT_Localization_JA,
    });

    // コンポーネントに定義したtableをpropsで渡す
    return <MaterialReactTable table={table} />;
}

export default MaterialsTable;
