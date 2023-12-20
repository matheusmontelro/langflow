"""Add profile-image column

Revision ID: 67cc006d50bf
Revises: 260dbcc8b680
Create Date: 2023-09-08 07:36:13.387318

"""
from typing import Sequence, Union

import sqlalchemy as sa
import sqlmodel
from alembic import op
from sqlalchemy.engine.reflection import Inspector

# revision identifiers, used by Alembic.
revision: str = "67cc006d50bf"
down_revision: Union[str, None] = "260dbcc8b680"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn) # type: ignore
    if "user" in inspector.get_table_names() and "profile_image" not in [
        column["name"] for column in inspector.get_columns("user")
    ]:
        with op.batch_alter_table("user", schema=None) as batch_op:
            batch_op.add_column(
                sa.Column(
                    "profile_image", sqlmodel.sql.sqltypes.AutoString(), nullable=True
                )
            )

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn) # type: ignore
    if "user" in inspector.get_table_names() and "profile_image" in [
        column["name"] for column in inspector.get_columns("user")
    ]:
        with op.batch_alter_table("user", schema=None) as batch_op:
            batch_op.drop_column("profile_image")

    # ### end Alembic commands ###
