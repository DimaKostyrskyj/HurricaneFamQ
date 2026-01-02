const config = require('../config.railway.js');

/**
 * Проверка наличия роли у пользователя
 * @param {GuildMember} member - Участник сервера
 * @param {string|Array} roleKeys - Ключ роли или массив ключей из config.json
 * @returns {boolean} - Есть ли у пользователя указанная роль
 */
function hasRole(member, roleKeys) {
    if (!Array.isArray(roleKeys)) {
        roleKeys = [roleKeys];
    }
    
    const memberRoleIds = member.roles.cache.map(role => role.id);
    
    for (const roleKey of roleKeys) {
        const roleId = config.roles[roleKey];
        if (roleId && memberRoleIds.includes(roleId)) {
            return true;
        }
    }
    
    return false;
}

/**
 * Проверка прав для заявок
 */
function canManageApplications(member) {
    return hasRole(member, ['dev', 'owner', 'dep_owner', 'ass', 'rec']);
}

/**
 * Проверка прав для запуска контрактов
 */
function canStartContract(member) {
    return hasRole(member, ['dev', 'owner', 'dep_owner', 'ass', 'contract']);
}

/**
 * Проверка прав для открытия регистрации на контракт
 */
function canOpenContract(member) {
    return hasRole(member, ['dev', 'owner', 'dep_owner', 'ass', 'contract', 'fam', 'academy']);
}

/**
 * Проверка прав для завершения контракта
 */
function canFinishContract(member) {
    return hasRole(member, ['dev', 'owner', 'dep_owner', 'ass', 'contract', 'fam', 'academy']);
}

/**
 * Проверка прав администратора
 */
function isAdmin(member) {
    return hasRole(member, ['dev', 'owner', 'dep_owner']);
}

/**
 * Получить название роли по ключу
 */
function getRoleName(guild, roleKey) {
    const roleId = config.roles[roleKey];
    if (!roleId) return roleKey;
    
    const role = guild.roles.cache.get(roleId);
    return role ? role.name : roleKey;
}

module.exports = {
    hasRole,
    canManageApplications,
    canStartContract,
    canOpenContract,
    canFinishContract,
    isAdmin,
    getRoleName
};
