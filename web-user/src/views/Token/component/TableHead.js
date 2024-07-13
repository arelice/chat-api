import PropTypes from 'prop-types';
import { TableCell, TableHead, TableRow, Checkbox } from '@mui/material';

const TokenTableHead = ({ numSelected, rowCount, onSelectAllClick, modelRatioEnabled, billingByRequestEnabled }) => {
  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
          />
        </TableCell>
        
        <TableCell sx={{ width: 'auto' }}>将所有最先进的AI聚合进行对话</TableCell>
        <TableCell sx={{ width: 'auto' }}>名称</TableCell>
        <TableCell sx={{ width: 'auto' }}>开关</TableCell>
        <TableCell key="expiry-time" sx={{ minWidth: 150, maxWidth: 150 }}>过期时间</TableCell>
{modelRatioEnabled && billingByRequestEnabled && (
  <TableCell key="billing-strategy" sx={{ minWidth: 150, maxWidth: 150 }}>计费策略</TableCell>
        )}
        <TableCell sx={{ width: 'auto' }}>操作</TableCell>
      </TableRow>
    </TableHead>
  );
};

TokenTableHead.propTypes = {
  modelRatioEnabled: PropTypes.bool,
  billingByRequestEnabled: PropTypes.bool,
  onSelectAllClick: PropTypes.func.isRequired,
  numSelected: PropTypes.number.isRequired,
  rowCount: PropTypes.number.isRequired
};

export default TokenTableHead;
